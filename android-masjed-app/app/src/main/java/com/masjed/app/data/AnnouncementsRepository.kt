package com.masjed.app.data

import com.masjed.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class AnnouncementsRepository(
    private val baseUrl: String = BuildConfig.BASE_API_URL
) {

    suspend fun fetchAnnouncements(): List<Announcement> = withContext(Dispatchers.IO) {
        val endpoint = baseUrl.trimEnd('/') + "/api/announcements"
        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            connectTimeout = 8000
            readTimeout = 8000
            requestMethod = "GET"
        }

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw IllegalStateException("announcement_http_$responseCode")
        }

        val response = connection.inputStream.use { stream ->
            BufferedReader(InputStreamReader(stream)).use { it.readText() }
        }

        val json = JSONObject(response)
        if (!json.optBoolean("ok", false)) {
            throw IllegalStateException(json.optString("error", "announcement_error"))
        }
        val array = json.optJSONArray("announcements") ?: return@withContext emptyList()
        buildList {
            for (i in 0 until array.length()) {
                val item = array.optJSONObject(i) ?: continue
                add(
                    Announcement(
                        title = item.optString("title"),
                        body = item.optString("body"),
                        highlight = item.optString("highlight").takeIf { it.isNotBlank() }
                    )
                )
            }
        }
    }
}
