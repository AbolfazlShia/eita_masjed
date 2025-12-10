package com.masjed.app.ui.common

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.masjed.app.storage.DeskShortcut
import com.masjed.app.storage.DeskShortcutStorage

class DeskShortcutViewModel : ViewModel() {

    private val _shortcut = MutableLiveData(DeskShortcutStorage.current())
    val shortcut: LiveData<DeskShortcut?> = _shortcut

    fun setShortcut(shortcut: DeskShortcut) {
        DeskShortcutStorage.save(shortcut)
        _shortcut.value = shortcut
    }

    fun clearShortcut() {
        DeskShortcutStorage.clear()
        _shortcut.value = null
    }
}
