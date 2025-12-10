package com.masjed.app

import android.content.Context
import android.content.Intent
import android.net.Uri

object IntentHelper {
    fun openExternal(context: Context, uri: Uri): Intent {
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return Intent.createChooser(intent, context.getString(R.string.app_name))
    }
}
