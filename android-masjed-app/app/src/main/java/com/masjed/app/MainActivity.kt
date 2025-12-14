package com.masjed.app

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.os.bundleOf
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.navigation.NavOptions
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
    private var currentDeskShortcut: DeskShortcut? = null
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

        deskShortcutViewModel.shortcut.value?.let { existing ->
            currentDeskShortcut = existing
            updateDeskTab(existing, existing)
        }

        deskShortcutViewModel.shortcut.observe(this) { shortcut ->
            val previous = currentDeskShortcut
            currentDeskShortcut = shortcut
            updateDeskTab(shortcut, previous)
        }
    }

    private fun navigateToDesk(shortcut: DeskShortcut) {
        val args = bundleOf(
            WebPageFragment.ARG_TITLE to shortcut.title,
            WebPageFragment.ARG_PATH to shortcut.path
        )
        val options = NavOptions.Builder()
            .setLaunchSingleTop(true)
            .setPopUpTo(R.id.nav_desk, true)
            .build()
        navController.navigate(R.id.nav_desk, args, options)
    }

    private fun updateDeskTab(shortcut: DeskShortcut?, previous: DeskShortcut?) {
        val deskItem = binding.bottomNav.menu.findItem(R.id.nav_desk) ?: return
        val hasShortcut = shortcut != null
        deskItem.isVisible = hasShortcut

        if (hasShortcut) {
            val activeShortcut = shortcut!!
            deskItem.title = activeShortcut.title
            if (shouldFocusDeskTab(previous, activeShortcut)) {
                if (binding.bottomNav.selectedItemId != R.id.nav_desk) {
                    binding.bottomNav.selectedItemId = R.id.nav_desk
                } else if (navController.currentDestination?.id != R.id.nav_desk) {
                    navigateToDesk(activeShortcut)
                }
            }
        } else {
            if (binding.bottomNav.selectedItemId == R.id.nav_desk) {
                binding.bottomNav.selectedItemId = R.id.nav_home
            }
            if (navController.currentDestination?.id == R.id.nav_desk) {
                navController.popBackStack(R.id.nav_desk, true)
                navController.navigate(R.id.nav_home)
            }
        }
    }

    private fun shouldFocusDeskTab(previous: DeskShortcut?, current: DeskShortcut): Boolean {
        val destinationId = navController.currentDestination?.id
        if (destinationId == R.id.nav_desk) return false
        if (destinationId == R.id.nav_web_page) return true
        return previous == null || previous.path != current.path
    }
}
