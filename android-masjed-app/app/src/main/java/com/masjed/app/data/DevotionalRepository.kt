package com.masjed.app.data

import com.masjed.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

data class DevotionalContent(
    val dayIndex: Int,
    val dayLabel: String,
    val duaTitle: String,
    val duaContent: String,
    val ziyaratTitle: String,
    val ziyaratContent: String
)

enum class DevotionalType(val queryValue: String) {
    Dua("dua"),
    Ziyarat("ziyarat");

    companion object {
        fun fromQueryValue(raw: String?): DevotionalType =
            values().firstOrNull { it.queryValue.equals(raw, ignoreCase = true) } ?: Dua
    }
}

class DevotionalRepository(
    private val baseUrl: String = BuildConfig.BASE_API_URL
) {

    suspend fun fetchDevotional(
        dayParam: Int,
        type: DevotionalType = DevotionalType.Dua
    ): DevotionalContent = withContext(Dispatchers.IO) {
        val endpoint = buildString {
            append(baseUrl.trimEnd('/'))
            append("/api/devotional?day=")
            append(dayParam)
            append("&type=")
            append(type.queryValue)
        }

        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            connectTimeout = 10000
            readTimeout = 10000
            requestMethod = "GET"
        }

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw IllegalStateException("devotional_http_$responseCode")
        }

        val response = connection.inputStream.use { stream ->
            BufferedReader(InputStreamReader(stream)).use { it.readText() }
        }

        val json = JSONObject(response)
        if (!json.optBoolean("ok", false)) {
            throw IllegalStateException(json.optString("error", "devotional_error"))
        }

        val entry = json.optJSONObject("entry") ?: json
        DevotionalContent(
            dayIndex = json.optInt("dayIndex", dayParam),
            dayLabel = entry.optString("dayLabel", json.optString("dayLabel", "")),
            duaTitle = entry.optString("duaTitle"),
            duaContent = entry.optString("duaContent"),
            ziyaratTitle = entry.optString("ziyaratTitle"),
            ziyaratContent = entry.optString("ziyaratContent")
        )
    }
}
