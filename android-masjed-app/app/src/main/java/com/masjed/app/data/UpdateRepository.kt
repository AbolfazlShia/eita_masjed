package com.masjed.app.data

import com.masjed.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

data class AppVersionInfo(
    val latestVersionCode: Int,
    val latestVersionName: String,
    val minVersionCode: Int,
    val apkUrl: String,
    val changelog: String?
)

class UpdateRepository(
    private val baseUrl: String = BuildConfig.BASE_API_URL
) {

    suspend fun fetchVersion(): AppVersionInfo = withContext(Dispatchers.IO) {
        val endpoint = baseUrl.trimEnd('/') + APP_VERSION_PATH
        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            connectTimeout = 8000
            readTimeout = 8000
            requestMethod = "GET"
        }

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw IllegalStateException("app_version_http_$responseCode")
        }

        val response = connection.inputStream.use { stream ->
            BufferedReader(InputStreamReader(stream)).use { it.readText() }
        }

        val json = JSONObject(response)
        AppVersionInfo(
            latestVersionCode = json.optInt("latestVersionCode", BuildConfig.VERSION_CODE),
            latestVersionName = json.optString("latestVersionName", BuildConfig.VERSION_NAME),
            minVersionCode = json.optInt("minVersionCode", BuildConfig.VERSION_CODE),
            apkUrl = json.optString("apkUrl", baseUrl.trimEnd('/') + "/masjed-app.apk"),
            changelog = json.optString("changelog").takeIf { it.isNotBlank() }
        )
    }

    companion object {
        private const val APP_VERSION_PATH = "/api/app-version"
    }
}
