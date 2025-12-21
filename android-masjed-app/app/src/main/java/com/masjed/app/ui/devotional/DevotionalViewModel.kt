package com.masjed.app.ui.devotional

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.masjed.app.data.DevotionalContent
import com.masjed.app.data.DevotionalRepository
import com.masjed.app.data.DevotionalType
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class DevotionalUiState(
    val selectedDateMillis: Long = 0L,
    val selectedDateLabel: String = "",
    val selectedDayIndex: Int = 0,
    val selectedDayParam: Int = 0,
    val isTodaySelected: Boolean = true,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val activeType: DevotionalType = DevotionalType.Dua,
    val dua: DevotionalContent? = null,
    val ziyarat: DevotionalContent? = null
)

class DevotionalViewModel(
    private val repository: DevotionalRepository = DevotionalRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DevotionalUiState())
    val uiState: StateFlow<DevotionalUiState> = _uiState

    private val tehranTimeZone: TimeZone = TimeZone.getTimeZone("Asia/Tehran")
    private val isoFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
        timeZone = tehranTimeZone
    }

    private var todayStartMillis: Long = startOfDayMillis(System.currentTimeMillis())
    private var selectedDateMillis: Long = todayStartMillis

    init {
        updateSelectedDate(todayStartMillis, shouldRefresh = true)
    }

    fun goToNextDay() = changeSelectedDayBy(1)

    fun goToPreviousDay() = changeSelectedDayBy(-1)

    fun goToToday() = updateSelectedDate(todayStartMillis, shouldRefresh = true)

    fun setActiveType(type: DevotionalType) {
        if (_uiState.value.activeType == type) return
        _uiState.update { it.copy(activeType = type) }
    }

    fun retry() = refreshDevotionalForSelection()

    fun setInitialDate(epochMillis: Long) {
        updateSelectedDate(epochMillis, shouldRefresh = true)
    }

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
        val dayParam = webDayIndex(dayIndex)
        _uiState.update {
            it.copy(
                selectedDateMillis = normalized,
                selectedDateLabel = formatShamsiLabel(normalized),
                selectedDayIndex = dayIndex,
                selectedDayParam = dayParam,
                isTodaySelected = normalized == todayStartMillis
            )
        }
        if (shouldRefresh) {
            refreshDevotionalForSelection()
        }
    }

    private fun refreshDevotionalForSelection() {
        val state = _uiState.value
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val dayParam = state.selectedDayParam
                val duaDeferred = async { repository.fetchDevotional(dayParam, DevotionalType.Dua) }
                val ziyaratDeferred = async { repository.fetchDevotional(dayParam, DevotionalType.Ziyarat) }
                val dua = duaDeferred.await()
                val ziyarat = ziyaratDeferred.await()
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        dua = dua,
                        ziyarat = ziyarat,
                        errorMessage = null,
                        selectedDateLabel = formatShamsiLabel(selectedDateMillis)
                    )
                }
            } catch (error: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "خطا در دریافت متن دعا یا زیارت"
                    )
                }
            }
        }
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

    private fun formatShamsiLabel(epochMillis: Long): String {
        val (jy, jm, jd) = jalaliFromMillis(epochMillis)
        val monthName = shamsiMonths.getOrElse(jm - 1) { "" }
        val calendar = Calendar.getInstance(tehranTimeZone).apply {
            timeInMillis = epochMillis
        }
        val weekDay = calendar.getDisplayName(Calendar.DAY_OF_WEEK, Calendar.LONG, Locale("fa")) ?: ""
        val datePart = "$jd $monthName $jy"
        return isoFormatter.format(Date(epochMillis)).takeIf { it.isNotBlank() }?.let {
            if (weekDay.isBlank()) datePart else "$weekDay $datePart"
        } ?: datePart
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
        val gy2 = if (gm > 2) gy + 1 else gy
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

    private fun webDayIndex(localIndex: Int): Int = (localIndex + 6) % 7

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
