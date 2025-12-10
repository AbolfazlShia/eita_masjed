package com.masjed.app.storage

import org.json.JSONObject

data class DeskShortcut(
    val title: String,
    val path: String,
    val origin: DeskOrigin,
    val persistent: Boolean = true
)

enum class DeskOrigin { ADMIN, BASIJ }

object DeskShortcutStorage {

    private const val KEY_SHORTCUT = "desk_shortcut_payload"
    private const val KEY_TITLE = "title"
    private const val KEY_PATH = "path"
    private const val KEY_ORIGIN = "origin"
    private const val KEY_PERSISTENT = "persistent"
    private var inMemoryShortcut: DeskShortcut? = null

    fun save(shortcut: DeskShortcut) {
        inMemoryShortcut = shortcut
        if (!shortcut.persistent) {
            SecureStorage.remove(KEY_SHORTCUT)
            return
        }
        val json = JSONObject()
            .put(KEY_TITLE, shortcut.title)
            .put(KEY_PATH, shortcut.path)
            .put(KEY_ORIGIN, shortcut.origin.name)
            .put(KEY_PERSISTENT, shortcut.persistent)
            .toString()
        SecureStorage.putString(KEY_SHORTCUT, json)
    }

    fun clear() {
        inMemoryShortcut = null
        SecureStorage.remove(KEY_SHORTCUT)
    }

    fun current(): DeskShortcut? {
        inMemoryShortcut?.let { return it }
        val raw = SecureStorage.getString(KEY_SHORTCUT)?.takeIf { it.isNotBlank() } ?: return null
        return try {
            val json = JSONObject(raw)
            val title = json.optString(KEY_TITLE).takeIf { it.isNotBlank() } ?: return null
            val path = json.optString(KEY_PATH).takeIf { it.isNotBlank() } ?: return null
            val origin = json.optString(KEY_ORIGIN)
                .takeIf { it.isNotBlank() }
                ?.let { runCatching { DeskOrigin.valueOf(it) }.getOrNull() }
                ?: return null
            DeskShortcut(
                title = title,
                path = path,
                origin = origin,
                persistent = json.optBoolean(KEY_PERSISTENT, true)
            ).also { inMemoryShortcut = it }
        } catch (_: Exception) {
            null
        }
    }
}
