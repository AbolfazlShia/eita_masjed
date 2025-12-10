package com.masjed.app

import android.app.Application
import com.masjed.app.storage.AppStorage
import com.masjed.app.storage.SecureStorage

class MasjedApp : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
        AppStorage.init(this)
        SecureStorage.init(this)
    }

    companion object {
        lateinit var instance: MasjedApp
            private set
    }
}
