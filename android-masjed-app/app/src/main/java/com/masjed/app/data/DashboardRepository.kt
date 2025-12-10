package com.masjed.app.data

import com.masjed.app.BuildConfig
import com.masjed.app.storage.AppStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class DashboardData(
    val shamsiDate: String,
    val gregorianDate: String,
    val city: String,
    val events: List<String>,
    val prayerTimes: Map<String, String>,
    val timestampLabel: String,
    val rawTimestamp: String? = null,
    val fetchedAt: Long = System.currentTimeMillis()
)

sealed class DashboardUiState {
    data object Loading : DashboardUiState()
    data class Success(val data: DashboardData) : DashboardUiState()
    data class Error(val message: String, val fallbackData: DashboardData) : DashboardUiState()
}

class DashboardRepository(
    private val baseUrl: String = BuildConfig.BASE_API_URL,
    private val pingPath: String = "/api/health"
) {
    private val cacheKey = "dashboard_json"

    suspend fun fetchDashboard(dateQuery: String? = null): DashboardData = withContext(Dispatchers.IO) {
        val apiUrl = buildString {
            append(baseUrl.trimEnd('/'))
            append("/api/prayer-by-date")
            if (!dateQuery.isNullOrBlank()) {
                append("?date=")
                append(dateQuery)
            }
        }

        wakeServer(maxAttempts = 1)

        val connection = (URL(apiUrl).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15000
            readTimeout = 15000
            requestMethod = "GET"
        }

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            return@withContext loadCachedDashboard(dateQuery) ?: throw IllegalStateException("Server responded with $responseCode")
        }

        val response = connection.inputStream.use { stream ->
            BufferedReader(InputStreamReader(stream)).use { reader ->
                reader.readText()
            }
        }

        val json = JSONObject(response)
        if (!json.optBoolean("ok", false)) {
            return@withContext loadCachedDashboard() ?: throw IllegalStateException(json.optString("error", "unknown_error"))
        }

        val prayerObj = json.optJSONObject("prayerTimes") ?: JSONObject()
        val events = json.optJSONArray("events")?.toList() ?: emptyList()
        val timestamp = json.optString("timestamp")
        val shamsiParts = json.optJSONObject("shamsiDate_parts")

        val dashboard = DashboardData(
            shamsiDate = normalizeShamsiDate(
                raw = json.optString("shamsiDate"),
                parts = shamsiParts,
                timestamp = timestamp
            ),
            gregorianDate = json.optString("gregorianDate", json.optString("date", "")),
            city = json.optString("city", ""),
            events = if (events.isNotEmpty()) events else defaultEvents(),
            prayerTimes = prayerObj.keys().asSequence().associateWith { key -> prayerObj.optString(key, "--:--") },
            timestampLabel = buildTimestampLabel(timestamp),
            rawTimestamp = timestamp,
            fetchedAt = System.currentTimeMillis()
        )

        AppStorage.putString(cacheKeyFor(dateQuery), dashboard.toJson().toString())
        dashboard
    }

    suspend fun wakeServer(maxAttempts: Int = 5, delayMillis: Long = 3000L): Boolean = withContext(Dispatchers.IO) {
        val pingUrl = baseUrl.trimEnd('/') + pingPath
        repeat(maxAttempts) { attempt ->
            try {
                val pingConnection = (URL(pingUrl).openConnection() as HttpURLConnection).apply {
                    connectTimeout = 6000
                    readTimeout = 6000
                    requestMethod = "GET"
                }
                val code = pingConnection.responseCode
                pingConnection.disconnect()
                if (code in 200..299) {
                    return@withContext true
                }
            } catch (_: Exception) {
                // ignored, try again after delay
            }
            if (attempt < maxAttempts - 1) {
                delay(delayMillis)
            }
        }
        return@withContext false
    }

    fun loadCachedDashboard(dateQuery: String? = null): DashboardData? {
        val stored = AppStorage.getString(cacheKeyFor(dateQuery)) ?: return null
        return try {
            parseDashboardJson(JSONObject(stored))
        } catch (_: Exception) {
            null
        }
    }

    fun fallbackDashboard(): DashboardData {
        val fallbackTimes = mapOf(
            "fajr" to "04:54",
            "sunrise" to "06:23",
            "zuhr" to "11:20",
            "asr" to "14:52",
            "sunset" to "16:17",
            "maghrib" to "16:37",
            "isha" to "18:15",
            "midnight" to "22:35"
        )
        val calendar = Calendar.getInstance()
        val gregorian = SimpleDateFormat("dd MMM yyyy", Locale.US).format(calendar.time)

        return DashboardData(
            shamsiDate = "یکشنبه 9 آذر 1404",
            gregorianDate = gregorian,
            city = "مشهد",
            events = defaultEvents(),
            prayerTimes = fallbackTimes,
            timestampLabel = "ذخیره آفلاین"
        )
    }

    private fun buildTimestampLabel(timestamp: String?): String {
        if (timestamp.isNullOrBlank()) return "زمان بروزرسانی نامشخص"
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val parsed: Date = parser.parse(timestamp) ?: return timestamp
            val formatter = SimpleDateFormat("HH:mm:ss - dd MMM", Locale("fa"))
            formatter.format(parsed)
        } catch (_: Exception) {
            timestamp
        }
    }

    private fun defaultEvents(): List<String> = listOf("بدون رویداد ویژه")

    private fun DashboardData.toJson(): JSONObject = JSONObject().apply {
        put("shamsiDate", shamsiDate)
        put("gregorianDate", gregorianDate)
        put("city", city)
        put("events", JSONArray(events))
        val prayersObj = JSONObject()
        prayerTimes.forEach { (key, value) -> prayersObj.put(key, value) }
        put("prayerTimes", prayersObj)
        put("timestampLabel", timestampLabel)
        put("rawTimestamp", rawTimestamp)
        put("fetchedAt", fetchedAt)
    }

    private fun parseDashboardJson(json: JSONObject): DashboardData = DashboardData(
        shamsiDate = json.optString("shamsiDate"),
        gregorianDate = json.optString("gregorianDate", json.optString("date", "")),
        city = json.optString("city"),
        events = json.optJSONArray("events")?.toList() ?: emptyList(),
        prayerTimes = json.optJSONObject("prayerTimes")?.let { obj ->
            obj.keys().asSequence().associateWith { key -> obj.optString(key, "--:--") }
        } ?: emptyMap(),
        timestampLabel = json.optString("timestampLabel"),
        rawTimestamp = json.optString("rawTimestamp"),
        fetchedAt = json.optLong("fetchedAt", System.currentTimeMillis())
    )
    private fun JSONArray.toList(): List<String> {
        val result = mutableListOf<String>()
        for (i in 0 until length()) {
            result.add(optString(i))
        }
        return result
    }

    private fun normalizeShamsiDate(raw: String?, parts: JSONObject?, timestamp: String?): String {
        val cleanedRaw = raw?.takeIf { !it.isNullOrBlank() }
        val rawYear = cleanedRaw?.let { extractYear(it) }
        if (!cleanedRaw.isNullOrBlank() && rawYear in 1300..1500) {
            return cleanedRaw
        }

        val year = parts?.optInt("year", -1) ?: -1
        val month = parts?.optInt("month", -1) ?: -1
        val day = parts?.optInt("day", -1) ?: -1

        if (year in 1300..1500 && month in 1..12 && day in 1..31) {
            val monthName = shamsiMonths[month - 1]
            val dayName = timestamp?.let { formatDayName(it) }
            val base = "$day $monthName $year"
            return if (dayName.isNullOrBlank()) base else "$dayName $base"
        }

        return cleanedRaw ?: "تاریخ نامشخص"
    }

    private fun extractYear(label: String): Int? {
        val matcher = YEAR_REGEX.find(label)
        return matcher?.value?.toIntOrNull()
    }

    private fun formatDayName(timestamp: String): String? {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val date = parser.parse(timestamp) ?: return null
            val formatter = SimpleDateFormat("EEEE", Locale("fa"))
            formatter.format(date)
        } catch (_: Exception) {
            null
        }
    }

    private fun cacheKeyFor(dateQuery: String?): String {
        return if (dateQuery.isNullOrBlank()) cacheKey else "${cacheKey}_$dateQuery"
    }

    companion object {
        private val YEAR_REGEX = Regex("(\\d{4})")
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
