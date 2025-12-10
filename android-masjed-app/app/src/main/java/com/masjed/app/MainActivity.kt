package com.masjed.app

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.os.bundleOf
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.NavigationUI
import androidx.navigation.ui.setupWithNavController
import com.masjed.app.databinding.ActivityMainBinding
import com.masjed.app.storage.DeskShortcut
import com.masjed.app.ui.common.DeskShortcutViewModel
import com.masjed.app.ui.web.WebPageFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val deskShortcutViewModel: DeskShortcutViewModel by viewModels()
    private val navController by lazy {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.navHostFragment) as NavHostFragment
        navHostFragment.navController
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        binding.bottomNav.setupWithNavController(navController)
        binding.bottomNav.menu.findItem(R.id.nav_desk)?.isVisible = false
        binding.bottomNav.setOnItemSelectedListener { item ->
            if (item.itemId == R.id.nav_desk) {
                deskShortcutViewModel.shortcut.value?.let { shortcut ->
                    navigateToDesk(shortcut)
                    true
                } ?: run {
                    false
                }
            } else {
                NavigationUI.onNavDestinationSelected(item, navController)
            }
        }
        binding.bottomNav.setOnItemReselectedListener { /* swallow reselection */ }

        deskShortcutViewModel.shortcut.observe(this) { shortcut ->
            updateDeskTab(shortcut)
        }
    }

    private fun navigateToDesk(shortcut: DeskShortcut) {
        val args = bundleOf(
            WebPageFragment.ARG_TITLE to shortcut.title,
            WebPageFragment.ARG_PATH to shortcut.path
        )
        navController.navigate(R.id.nav_desk, args)
    }

    private fun updateDeskTab(shortcut: DeskShortcut?) {
        val deskItem = binding.bottomNav.menu.findItem(R.id.nav_desk) ?: return
        val isVisible = shortcut != null
        deskItem.isVisible = isVisible
        if (isVisible) {
            deskItem.title = shortcut?.title
        } else if (binding.bottomNav.selectedItemId == R.id.nav_desk) {
            binding.bottomNav.selectedItemId = R.id.nav_home
        }
    }
}
