package com.masjed.app.ui.server

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebSettings
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.masjed.app.R
import com.masjed.app.data.DashboardRepository
import com.masjed.app.databinding.FragmentServerWakeBinding
import com.masjed.app.util.NetworkUtils
import com.masjed.app.util.UrlUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class ServerWakeFragment : Fragment(R.layout.fragment_server_wake) {

    private var _binding: FragmentServerWakeBinding? = null
    private val binding get() = _binding!!

    private val repository = DashboardRepository()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentServerWakeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupWebPreview()
        binding.buttonRetry.setOnClickListener { attemptWake() }
        attemptWake()
    }

    override fun onDestroyView() {
        binding.webPreview.apply {
            stopLoading()
            destroy()
        }
        _binding = null
        super.onDestroyView()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebPreview() {
        binding.webPreview.apply {
            settings.javaScriptEnabled = true
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            settings.domStorageEnabled = true
            loadUrl(UrlUtils.baseWebUrl())
        }
    }

    private fun attemptWake() {
        if (!isAdded) return
        val hasNetwork = NetworkUtils.isOnline(requireContext())
        binding.statusOverlay.isVisible = false
        binding.buttonRetry.isVisible = false
        binding.progressBar.isVisible = false
        if (!hasNetwork) {
            binding.statusOverlay.isVisible = true
            binding.stateText.setText(R.string.error_network_unavailable)
            binding.buttonRetry.isVisible = true
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            val success = repository.wakeServer(maxAttempts = 5, delayMillis = 3000L)
            if (!isAdded) return@launch
            if (success) {
                delay(1200)
                navigateHome()
            } else {
                binding.statusOverlay.isVisible = true
                binding.stateText.setText(R.string.server_wake_failed)
                binding.progressBar.isVisible = false
                binding.buttonRetry.isVisible = true
            }
        }
    }

    private fun navigateHome() {
        val navController = findNavController()
        navController.navigate(R.id.nav_home)
    }
}
