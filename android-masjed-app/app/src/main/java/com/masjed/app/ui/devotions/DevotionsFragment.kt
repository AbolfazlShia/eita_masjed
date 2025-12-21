package com.masjed.app.ui.devotions

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.masjed.app.R
import com.masjed.app.data.DevotionalType
import com.masjed.app.databinding.FragmentDevotionsBinding
import com.masjed.app.ui.devotional.DevotionalUiState
import com.masjed.app.ui.devotional.DevotionalViewModel
import kotlinx.coroutines.launch

class DevotionsFragment : Fragment() {

    companion object {
        const val ARG_INITIAL_DATE = "arg_initial_date"
        const val ARG_INITIAL_TYPE = "arg_initial_type"
    }

    private var _binding: FragmentDevotionsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DevotionalViewModel by viewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentDevotionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupInteractions()
        applyInitialArguments()
        collectUiState()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun setupInteractions() {
        binding.buttonPrevDay.setOnClickListener { viewModel.goToPreviousDay() }
        binding.buttonNextDay.setOnClickListener { viewModel.goToNextDay() }
        binding.buttonToday.setOnClickListener { viewModel.goToToday() }
        binding.switchPrayer.setOnClickListener { viewModel.setActiveType(DevotionalType.Dua) }
        binding.switchZiyarat.setOnClickListener { viewModel.setActiveType(DevotionalType.Ziyarat) }
        binding.buttonRetry.setOnClickListener { viewModel.retry() }
    }

    private fun applyInitialArguments() {
        val initialDate = arguments?.getLong(ARG_INITIAL_DATE, -1L) ?: -1L
        val initialTypeRaw = arguments?.getString(ARG_INITIAL_TYPE)
        val initialType = DevotionalType.fromQueryValue(initialTypeRaw)

        if (initialDate > 0) {
            viewModel.setInitialDate(initialDate)
        }
        viewModel.setActiveType(initialType)
    }

    private fun collectUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderState(state)
                }
            }
        }
    }

    private fun renderState(state: DevotionalUiState) {
        binding.textSelectedDate.text = state.selectedDateLabel
        binding.buttonToday.isVisible = !state.isTodaySelected

        val isDua = state.activeType == DevotionalType.Dua
        binding.switchPrayer.isChecked = isDua
        binding.switchZiyarat.isChecked = !isDua
        updateSwitchStyles(isDua)

        binding.progressIndicator.isVisible = state.isLoading
        binding.errorGroup.isVisible = state.errorMessage != null
        binding.errorMessage.text = state.errorMessage

        val activeContent = if (state.activeType == DevotionalType.Dua) state.dua else state.ziyarat
        binding.textDevotionTitle.text = activeContent?.let {
            if (state.activeType == DevotionalType.Dua) it.duaTitle else it.ziyaratTitle
        } ?: getString(R.string.devotional_screen_title)

        binding.textDevotionDay.text = activeContent?.dayLabel?.let {
            getString(R.string.devotional_daily_label, it)
        } ?: ""

        binding.textDevotionBody.text = activeContent?.let {
            if (state.activeType == DevotionalType.Dua) it.duaContent else it.ziyaratContent
        } ?: ""
    }

    private fun updateSwitchStyles(isDuaActive: Boolean) {
        val activeDrawable = R.drawable.bg_devotion_chip_active
        val inactiveDrawable = R.drawable.bg_devotion_toggle_inactive
        val activeTextColor = ContextCompat.getColor(requireContext(), android.R.color.white)
        val inactiveTextColor = ContextCompat.getColor(requireContext(), R.color.colorOnBackground)

        binding.switchPrayer.apply {
            setBackgroundResource(if (isDuaActive) activeDrawable else inactiveDrawable)
            setTextColor(if (isDuaActive) activeTextColor else inactiveTextColor)
        }

        binding.switchZiyarat.apply {
            setBackgroundResource(if (!isDuaActive) activeDrawable else inactiveDrawable)
            setTextColor(if (!isDuaActive) activeTextColor else inactiveTextColor)
        }
    }
}
