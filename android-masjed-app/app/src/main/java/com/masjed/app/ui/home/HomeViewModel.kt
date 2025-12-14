package com.masjed.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.masjed.app.BuildConfig
import com.masjed.app.MasjedApp
import com.masjed.app.data.Announcement
import com.masjed.app.data.AnnouncementsRepository
import com.masjed.app.data.AppVersionInfo
import com.masjed.app.data.DailyPrayer
import com.masjed.app.data.DashboardData
import com.masjed.app.data.DashboardRepository
import com.masjed.app.data.DashboardUiState
import com.masjed.app.data.Hadith
import com.masjed.app.data.HomeContentRepository
import com.masjed.app.data.QuickAction
import com.masjed.app.data.ShamsiEventsRepository
import com.masjed.app.data.UpdateRepository
import com.masjed.app.util.NetworkUtils
import com.masjed.app.R
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class HomeUiState(
    val dashboardState: DashboardUiState = DashboardUiState.Loading,
    val quickActions: List<QuickAction> = emptyList(),
    val announcements: List<Announcement> = emptyList(),
    val hadith: Hadith? = null,
    val dailyPrayer: DailyPrayer? = null,
    val dailyEvents: List<String> = emptyList(),
    val devotionDayLabel: String = "",
    val devotionDayParam: Int = 0,
    val selectedDateMillis: Long = 0L,
    val selectedDayIndex: Int = 0,
    val isTodaySelected: Boolean = true,
    val selectedDateLabel: String = "",
    val updateState: UpdateState = UpdateState.Idle
)

sealed interface UpdateState {
    data object Idle : UpdateState
    data object Checking : UpdateState
    data class Required(val info: AppVersionInfo) : UpdateState
}

class HomeViewModel(
    private val dashboardRepository: DashboardRepository = DashboardRepository(),
    private val contentRepository: HomeContentRepository = HomeContentRepository,
    private val announcementsRepository: AnnouncementsRepository = AnnouncementsRepository(),
    private val updateRepository: UpdateRepository = UpdateRepository(),
    private val shamsiEventsRepository: ShamsiEventsRepository = ShamsiEventsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private val quickActionsCache = contentRepository.quickActions()
    private val announcementsCache = contentRepository.announcements()
    private val hadithsCache = contentRepository.hadiths()

    private val tehranTimeZone: TimeZone = TimeZone.getTimeZone("Asia/Tehran")
    private val isoDateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
        timeZone = tehranTimeZone
    }

    private var todayStartMillis: Long = startOfDayMillis(System.currentTimeMillis())
    private var selectedDateMillis: Long = todayStartMillis

    init {
        updateSelectedDate(todayStartMillis, shouldRefresh = false)
        _uiState.value = _uiState.value.copy(announcements = announcementsCache)
        refreshDashboardForSelectedDate()
        refreshAnnouncements()
        checkForUpdates()
    }

    fun refreshDashboard() {
        refreshDashboardForSelectedDate()
    }

    fun goToNextDay() = changeSelectedDayBy(1)

    fun goToPreviousDay() = changeSelectedDayBy(-1)

    fun goToToday() = updateSelectedDate(todayStartMillis, shouldRefresh = true)

    private fun changeSelectedDayBy(offset: Int) {
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = selectedDateMillis
            add(Calendar.DAY_OF_YEAR, offset)
        }
        updateSelectedDate(calendar.timeInMillis, shouldRefresh = true)
    }

    private fun updateSelectedDate(targetMillis: Long, shouldRefresh: Boolean) {
        val normalized = startOfDayMillis(targetMillis)
        selectedDateMillis = normalized
        val dayIndex = dayIndexFromMillis(normalized)
        _uiState.value = _uiState.value.copy(
            selectedDateMillis = normalized,
            selectedDayIndex = dayIndex,
            isTodaySelected = isSameDay(normalized, todayStartMillis),
            selectedDateLabel = formatShamsiLabel(normalized)
        )
        updateDailyContent(dayIndex)
        if (shouldRefresh) {
            refreshDashboardForSelectedDate()
        }
    }

    private fun refreshAnnouncements() {
        viewModelScope.launch {
            try {
                val remote = announcementsRepository.fetchAnnouncements()
                val resolved = if (remote.isNotEmpty()) remote else announcementsCache
                _uiState.value = _uiState.value.copy(announcements = resolved)
            } catch (_: Exception) {
                _uiState.value = _uiState.value.copy(announcements = announcementsCache)
            }
        }
    }

    private fun refreshDashboardForSelectedDate() {
        val dateQuery = isoDateFormatter.format(Date(selectedDateMillis))
        _uiState.value = _uiState.value.copy(dashboardState = DashboardUiState.Loading)
        viewModelScope.launch {
            try {
                val dashboard = dashboardRepository.fetchDashboard(dateQuery)
                _uiState.value = _uiState.value.copy(
                    dashboardState = DashboardUiState.Success(dashboard)
                )
            } catch (_: Exception) {
                val fallback = dashboardRepository.fallbackDashboard()
                val context = MasjedApp.instance
                val messageRes = if (NetworkUtils.isOnline(context)) {
                    R.string.error_server_unavailable
                } else {
                    R.string.error_network_unavailable
                }
                _uiState.value = _uiState.value.copy(
                    dashboardState = DashboardUiState.Error(
                        message = context.getString(messageRes),
                        fallbackData = fallback
                    )
                )
            }
        }
    }

    private fun updateDailyContent(dayIndex: Int) {
        val hadith = if (hadithsCache.isNotEmpty()) {
            hadithsCache[dayIndex % hadithsCache.size]
        } else {
            null
        }
        val dailyPrayer = contentRepository.dailyPrayerFor(dayIndex)
        val (_, jalaliMonth, jalaliDay) = jalaliFromMillis(selectedDateMillis)
        val shamsiEvents = shamsiEventsRepository.eventsFor(jalaliMonth, jalaliDay)
        val fallbackEvents = contentRepository.dailyEventsFor(dayIndex)
        val resolvedEvents = if (shamsiEvents.isNotEmpty()) shamsiEvents else fallbackEvents
        _uiState.value = _uiState.value.copy(
            quickActions = quickActionsCache,
            hadith = hadith,
            dailyPrayer = dailyPrayer,
            dailyEvents = resolvedEvents,
            devotionDayLabel = dailyPrayer?.dayLabel ?: dayLabelForIndex(dayIndex),
            devotionDayParam = webDayIndex(dayIndex)
        )
    }

    private fun startOfDayMillis(epochMillis: Long): Long {
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = epochMillis
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return calendar.timeInMillis
    }

    private fun dayIndexFromMillis(epochMillis: Long): Int {
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = epochMillis
        }
        return calendarDayIndex(calendar.get(Calendar.DAY_OF_WEEK))
    }

    private fun isSameDay(a: Long, b: Long): Boolean = a == b

    private fun parseServerTimestamp(raw: String?): Long? {
        if (raw.isNullOrBlank()) return null
        return try {
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.parse(raw)?.time
        } catch (_: Exception) {
            null
        }
    }

    private fun formatShamsiLabel(epochMillis: Long): String {
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = epochMillis
        }
        val (jy, jm, jd) = jalaliFromMillis(epochMillis)
        val weekDay = calendar.getDisplayName(Calendar.DAY_OF_WEEK, Calendar.LONG, Locale("fa")) ?: ""
        val monthName = shamsiMonths.getOrElse(jm - 1) { "" }
        val datePart = "$jd $monthName $jy"
        return if (weekDay.isBlank()) datePart else "$weekDay $datePart"
    }

    private fun jalaliFromMillis(epochMillis: Long): Triple<Int, Int, Int> {
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = epochMillis
        }
        val gy = calendar.get(Calendar.YEAR)
        val gm = calendar.get(Calendar.MONTH) + 1
        val gd = calendar.get(Calendar.DAY_OF_MONTH)
        return gregorianToJalali(gy, gm, gd)
    }

    private fun gregorianToJalali(gy: Int, gm: Int, gd: Int): Triple<Int, Int, Int> {
        val gMonthDays = intArrayOf(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334)
        var gy2 = if (gm > 2) gy + 1 else gy
        var days = 355666 + (365 * gy) + ((gy2 + 3) / 4) - ((gy2 + 99) / 100) + ((gy2 + 399) / 400) + gd + gMonthDays[gm - 1]
        var jy = -1595 + 33 * (days / 12053)
        days %= 12053
        jy += 4 * (days / 1461)
        days %= 1461
        if (days > 365) {
            jy += (days - 1) / 365
            days = (days - 1) % 365
        }
        val jm: Int
        val jd: Int
        if (days < 186) {
            jm = 1 + days / 31
            jd = 1 + days % 31
        } else {
            jm = 7 + (days - 186) / 30
            jd = 1 + (days - 186) % 30
        }
        return Triple(jy, jm, jd)
    }

    private fun calendarDayIndex(dayOfWeek: Int): Int = when (dayOfWeek) {
        Calendar.SATURDAY -> 0
        Calendar.SUNDAY -> 1
        Calendar.MONDAY -> 2
        Calendar.TUESDAY -> 3
        Calendar.WEDNESDAY -> 4
        Calendar.THURSDAY -> 5
        Calendar.FRIDAY -> 6
        else -> 0
    }

    private fun dayLabelForIndex(index: Int): String = when (index) {
        0 -> "شنبه"
        1 -> "یکشنبه"
        2 -> "دوشنبه"
        3 -> "سهشنبه"
        4 -> "چهارشنبه"
        5 -> "پنجشنبه"
        6 -> "جمعه"
        else -> ""
    }

    private fun webDayIndex(localIndex: Int): Int = (localIndex + 6) % 7

    private fun checkForUpdates() {
        _uiState.value = _uiState.value.copy(updateState = UpdateState.Checking)
        viewModelScope.launch {
            try {
                val info = updateRepository.fetchVersion()
                val requiresUpdate = BuildConfig.VERSION_CODE < info.minVersionCode
                val state = if (requiresUpdate) UpdateState.Required(info) else UpdateState.Idle
                _uiState.value = _uiState.value.copy(updateState = state)
            } catch (_: Exception) {
                _uiState.value = _uiState.value.copy(updateState = UpdateState.Idle)
            }
        }
    }

    companion object {
        private val shamsiMonths = arrayOf(
            "فروردین",
            "اردیبهشت",
            "خرداد",
            "تیر",
            "مرداد",
            "شهریور",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسفند"
        )
    }
}
