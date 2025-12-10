package com.masjed.app.util

import android.net.Uri
import com.masjed.app.BuildConfig

object UrlUtils {

    fun buildWebUrl(path: String = ""): String {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path
        }

        val normalizedPath = when {
            path.isBlank() -> ""
            path.startsWith("/") -> path
            else -> "/$path"
        }

        val (pathPart, pathQuery) = splitPathAndQuery(normalizedPath)
        val baseParts = BuildConfig.BASE_WEB_URL.split("?", limit = 2)
        val baseRoot = baseParts[0].trimEnd('/')
        val baseQuery = baseParts.getOrNull(1)

        val result = StringBuilder()
        result.append(baseRoot)
        if (pathPart.isNotBlank()) {
            result.append(pathPart)
        }

        val querySegments = mutableListOf<String>()
        if (!pathQuery.isNullOrBlank()) {
            querySegments += pathQuery
        }
        if (!baseQuery.isNullOrBlank()) {
            querySegments += baseQuery
        }
        if (querySegments.isNotEmpty()) {
            result.append('?')
            result.append(querySegments.joinToString("&"))
        }

        return result.toString()
    }

    fun webHostMatches(uri: Uri): Boolean {
        val baseHost = Uri.parse(BuildConfig.BASE_WEB_URL).host
        return baseHost != null && baseHost == uri.host
    }

    fun baseWebUrl(): String = BuildConfig.BASE_WEB_URL

    private fun splitPathAndQuery(input: String): Pair<String, String?> {
        if (input.isBlank()) return "" to null
        val questionIndex = input.indexOf('?')
        return if (questionIndex == -1) {
            input to null
        } else {
            val path = input.substring(0, questionIndex)
            val query = input.substring(questionIndex + 1)
            path to query.takeIf { it.isNotBlank() }
        }
    }
}
