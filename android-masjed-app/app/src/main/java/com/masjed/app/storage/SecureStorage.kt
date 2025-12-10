package com.masjed.app.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object SecureStorage {

    private const val FILE_NAME = "masjed_secure"
    private lateinit var preferences: SharedPreferences

    fun init(context: Context) {
        if (::preferences.isInitialized) return
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        preferences = EncryptedSharedPreferences.create(
            context,
            FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private fun ensureInitialized() {
        check(::preferences.isInitialized) { "SecureStorage is not initialized" }
    }

    fun putString(key: String, value: String) {
        ensureInitialized()
        preferences.edit().putString(key, value).apply()
    }

    fun getString(key: String): String? {
        ensureInitialized()
        return preferences.getString(key, null)
    }

    fun remove(key: String) {
        ensureInitialized()
        preferences.edit().remove(key).apply()
    }
}
