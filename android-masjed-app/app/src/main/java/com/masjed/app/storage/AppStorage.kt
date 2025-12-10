package com.masjed.app.storage

import android.content.Context
import android.content.SharedPreferences

object AppStorage {
    private const val PREF_NAME = "masjed_app_storage"
    private lateinit var preferences: SharedPreferences

    fun init(context: Context) {
        if (::preferences.isInitialized) return
        preferences = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    private fun ensureInitialized() {
        check(::preferences.isInitialized) { "AppStorage is not initialized" }
    }

    fun putString(key: String, value: String) {
        ensureInitialized()
        preferences.edit().putString(key, value).apply()
    }

    fun getString(key: String): String? {
        ensureInitialized()
        return preferences.getString(key, null)
    }

    fun putLong(key: String, value: Long) {
        ensureInitialized()
        preferences.edit().putLong(key, value).apply()
    }

    fun getLong(key: String, defaultValue: Long = 0L): Long {
        ensureInitialized()
        return preferences.getLong(key, defaultValue)
    }

    fun remove(key: String) {
        ensureInitialized()
        preferences.edit().remove(key).apply()
    }
}
