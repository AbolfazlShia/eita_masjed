package com.masjed.app.ui.home

import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.card.MaterialCardView
import com.google.android.material.snackbar.Snackbar
import com.masjed.app.IntentHelper
import com.masjed.app.R
import com.masjed.app.data.DashboardData
import com.masjed.app.data.DashboardUiState
import com.masjed.app.data.QuickAction
import com.masjed.app.ui.home.UpdateState
import com.masjed.app.ui.web.WebPageFragment
import com.masjed.app.databinding.FragmentHomeBinding
import com.masjed.app.databinding.ItemPrayerTimeBinding
import com.masjed.app.databinding.ItemQuickActionBinding
import com.masjed.app.util.UrlUtils
import kotlinx.coroutines.launch

class HomeFragment : Fragment(R.layout.fragment_home) {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels()

    private lateinit var prayerCards: List<PrayerCard>
    private var manualRefreshTriggered = false

    data class PrayerCard(
        val binding: ItemPrayerTimeBinding,
        val key: String,
        val title: String
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupPrayerCards()
        setupActions()
        setupSwipeRefresh()
        collectUiState()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setupPrayerCards() {
        prayerCards = listOf(
            PrayerCard(binding.cardFajr, "fajr", "اذان صبح"),
            PrayerCard(binding.cardSunrise, "sunrise", "طلوع خورشید"),
            PrayerCard(binding.cardZuhr, "zuhr", "اذان ظهر"),
            PrayerCard(binding.cardSunset, "sunset", "غروب خورشید"),
            PrayerCard(binding.cardMaghrib, "maghrib", "اذان مغرب"),
            PrayerCard(binding.cardMidnight, "midnight", "نیمه شب شرعی")
        )

        prayerCards.forEach { card ->
            card.binding.prayerTitle.text = card.title
            card.binding.prayerTime.text = "--:--"
        }
    }

    private fun renderSelectedDate(state: HomeUiState) {
        val label = state.selectedDateLabel.ifBlank { binding.textShamsiDate.text.toString() }
        binding.textShamsiDate.text = label
        binding.textPrayerSelectedDate.text = label
        binding.buttonToday.isVisible = !state.isTodaySelected
        binding.buttonToday.isEnabled = !state.isTodaySelected
    }

    private fun setupActions() {
        binding.retryButton.setOnClickListener { viewModel.refreshDashboard() }
        binding.buttonOpenFullSite.setOnClickListener {
            val uri = Uri.parse(UrlUtils.baseWebUrl())
            startActivity(IntentHelper.openExternal(requireContext(), uri))
        }
        binding.buttonPreviousDay.setOnClickListener { viewModel.goToPreviousDay() }
        binding.buttonNextDay.setOnClickListener { viewModel.goToNextDay() }
        binding.buttonToday.setOnClickListener { viewModel.goToToday() }
        binding.buttonForceUpdate.setOnClickListener {
            val updateInfo = (viewModel.uiState.value.updateState as? UpdateState.Required)?.info
            if (updateInfo == null) {
                Toast.makeText(requireContext(), R.string.dashboard_loading, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val uri = Uri.parse(updateInfo.apkUrl)
            startActivity(IntentHelper.openExternal(requireContext(), uri))
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setOnRefreshListener {
            manualRefreshTriggered = true
            viewModel.refreshDashboard()
        }
        binding.swipeRefresh.setColorSchemeResources(
            R.color.emeraldAccent,
            R.color.emeraldAccentDark
        )
    }

    private fun collectUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderSelectedDate(state)
                    renderDashboard(state.dashboardState, state.dailyEvents)
                    renderQuickActions(state.quickActions)
                    renderAnnouncements(state.announcements)
                    renderHadith(state.hadith)
                    renderDevotionLinks(state.devotionDayLabel, state.devotionDayParam)
                    renderUpdateState(state.updateState)
                }
            }
        }
    }

    private fun renderDashboard(state: DashboardUiState, fallbackEvents: List<String>) {
        when (state) {
            is DashboardUiState.Loading -> showStateOverlay(getString(R.string.dashboard_loading), showRetry = false)
            is DashboardUiState.Success -> {
                hideStateOverlay()
                renderDashboardData(state.data, fallbackEvents)
                handleRefreshResult(success = true)
            }
            is DashboardUiState.Error -> {
                showStateOverlay(state.message, showRetry = true)
                renderDashboardData(state.fallbackData, fallbackEvents)
                handleRefreshResult(success = false)
            }
        }
    }

    private fun renderDashboardData(data: DashboardData, fallbackEvents: List<String>) {
        binding.textCity.text = data.city

        val events = if (data.events.isNotEmpty()) data.events else fallbackEvents
        binding.textEvents.text = events.firstOrNull() ?: getString(R.string.dashboard_no_event)

        val prayerLabels = mapOf(
            "fajr" to "اذان صبح",
            "sunrise" to "طلوع خورشید",
            "zuhr" to "اذان ظهر",
            "sunset" to "غروب خورشید",
            "maghrib" to "اذان مغرب",
            "midnight" to "نیمه شب شرعی"
        )

        prayerCards.forEach { card ->
            val label = prayerLabels[card.key]
            label?.let { card.binding.prayerTitle.text = it }
            val time = data.prayerTimes[card.key] ?: "--:--"
            card.binding.prayerTime.text = time
        }
    }

    private fun renderQuickActions(actions: List<QuickAction>) {
        binding.quickActionsList.removeAllViews()
        if (actions.isEmpty()) return
        val inflater = LayoutInflater.from(requireContext())
        actions.forEach { action ->
            val itemBinding = ItemQuickActionBinding.inflate(inflater, binding.quickActionsList, false)
            itemBinding.quickActionIcon.text = action.icon
            itemBinding.quickActionTitle.text = action.title
            itemBinding.quickActionDescription.text = action.description
            itemBinding.quickActionHint.text = if (action.disabled) getString(R.string.quick_action_disabled) else getString(R.string.quick_action_hint)

            val gradient = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(action.accentStart, action.accentEnd)
            )
            gradient.cornerRadius = resources.getDimension(R.dimen.quick_action_corner_radius)
            itemBinding.quickActionCard.background = gradient
            itemBinding.quickActionCard.alpha = if (action.disabled) 0.5f else 1f

            itemBinding.quickActionCard.isEnabled = !action.disabled
            itemBinding.quickActionCard.setOnClickListener {
                if (!action.disabled) {
                        openWebPage(action.title, action.destination)
                }
            }
            binding.quickActionsList.addView(itemBinding.root)
        }
    }

    private fun renderAnnouncements(announcements: List<com.masjed.app.data.Announcement>) {
        binding.announcementsList.removeAllViews()
        if (announcements.isEmpty()) return
        val context = binding.root.context
        announcements.forEach { announcement ->
            val card = MaterialCardView(context).apply {
                layoutParams = ViewGroup.MarginLayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = resources.getDimensionPixelSize(R.dimen.announcement_spacing)
                }
                radius = resources.getDimension(R.dimen.announcement_corner)
                cardElevation = resources.getDimension(R.dimen.announcement_card_elevation)
                strokeWidth = 0
                setCardBackgroundColor(Color.TRANSPARENT)
                setContentPadding(0, 0, 0, 0)
            }
            val container = LayoutInflater.from(context).inflate(R.layout.view_announcement, card, false).apply {
                background = resources.getDrawable(R.drawable.bg_announcement_card, context.theme)
                setPadding(
                    resources.getDimensionPixelSize(R.dimen.announcement_padding),
                    resources.getDimensionPixelSize(R.dimen.announcement_padding),
                    resources.getDimensionPixelSize(R.dimen.announcement_padding),
                    resources.getDimensionPixelSize(R.dimen.announcement_padding)
                )
                findViewById<TextView>(R.id.announcementTitle).text = announcement.title
                findViewById<TextView>(R.id.announcementBody).apply {
                    text = announcement.body
                    isVisible = announcement.body.isNotBlank()
                }
                val highlightView = findViewById<TextView>(R.id.announcementHighlight)
                val highlightText = announcement.highlight
                highlightView.isVisible = !highlightText.isNullOrBlank()
                highlightView.text = highlightText
            }
            card.addView(container)
            binding.announcementsList.addView(card)
        }
    }

    private fun renderHadith(hadith: com.masjed.app.data.Hadith?) {
        binding.heroHadithContainer.isVisible = hadith != null
        if (hadith == null) {
            binding.textHadith.text = ""
            binding.textHadithTranslation.text = ""
            binding.textHadithSource.text = ""
            return
        }
        binding.textHadith.text = hadith.text
        binding.textHadithTranslation.text = hadith.translation
        binding.textHadithSource.text = hadith.source
    }

    private fun renderDevotionLinks(dayLabel: String, dayParam: Int) {
        val hasData = dayLabel.isNotBlank()
        binding.heroDevotionContainer.isVisible = hasData
        if (!hasData) {
            binding.buttonDailyPrayer.setOnClickListener(null)
            binding.buttonDailyZiyarat.setOnClickListener(null)
            return
        }

        binding.textDevotionTitle.text = getString(R.string.devotion_card_title, dayLabel)
        binding.textDevotionDescription.text = getString(R.string.devotion_card_subtitle, dayLabel)

        binding.buttonDailyPrayer.text = getString(R.string.devotion_prayer_button, dayLabel)
        binding.buttonDailyPrayer.setOnClickListener {
            openWebPage(
                title = getString(R.string.devotion_prayer_button, dayLabel),
                path = "/devotional?type=dua&day=$dayParam"
            )
        }

        binding.buttonDailyZiyarat.text = getString(R.string.devotion_ziyarat_button, dayLabel)
        binding.buttonDailyZiyarat.setOnClickListener {
            openWebPage(
                title = getString(R.string.devotion_ziyarat_button, dayLabel),
                path = "/devotional?type=ziyarat&day=$dayParam"
            )
        }
    }

    private fun renderUpdateState(state: UpdateState) {
        when (state) {
            UpdateState.Idle -> binding.updatePromptContainer.isVisible = false
            UpdateState.Checking -> {
                binding.updatePromptContainer.isVisible = false
            }
            is UpdateState.Required -> {
                binding.updatePromptContainer.isVisible = true
                binding.textUpdateBody.text = getString(R.string.update_required_body, state.info.latestVersionName)
            }
        }
    }

    private fun showStateOverlay(message: String, showRetry: Boolean) {
        binding.stateContainer.visibility = View.VISIBLE
        binding.stateMessage.text = message
        binding.progressIndicator.visibility = if (showRetry) View.GONE else View.VISIBLE
        binding.retryButton.visibility = if (showRetry) View.VISIBLE else View.GONE
    }

    private fun hideStateOverlay() {
        binding.stateContainer.visibility = View.GONE
    }

    private fun handleRefreshResult(success: Boolean) {
        if (binding.swipeRefresh.isRefreshing) {
            binding.swipeRefresh.isRefreshing = false
        }
        if (manualRefreshTriggered) {
            val message = if (success) R.string.refresh_success else R.string.refresh_failure
            Snackbar.make(binding.homeContainer, message, Snackbar.LENGTH_SHORT)
                .setBackgroundTint(resources.getColor(R.color.emeraldAccentDark, requireContext().theme))
                .setTextColor(Color.WHITE)
                .show()
            manualRefreshTriggered = false
        }
    }

    private fun openWebPage(title: String, path: String) {
        val finalPath = if (path.startsWith("/devotional")) {
            val normalized = if (path.contains("inApp=")) {
                path
            } else {
                val hasQuery = path.contains('?')
                val separator = if (hasQuery) '&' else '?'
                "$path${separator}inApp=1"
            }
            normalized.replace("?source=pw", "", ignoreCase = true)
        } else {
            path
        }
        val args = bundleOf(
            WebPageFragment.ARG_TITLE to title,
            WebPageFragment.ARG_PATH to finalPath
        )
        findNavController().navigate(R.id.nav_web_page, args)
    }
}
