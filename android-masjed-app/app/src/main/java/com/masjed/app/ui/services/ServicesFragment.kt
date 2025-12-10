package com.masjed.app.ui.services

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.StringRes
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.masjed.app.R
import com.masjed.app.databinding.FragmentServicesBinding
import com.masjed.app.ui.web.WebPageFragment
import com.masjed.app.util.UrlUtils

class ServicesFragment : Fragment(R.layout.fragment_services) {

    private var _binding: FragmentServicesBinding? = null
    private val binding get() = _binding!!

    private val services = listOf(
        ServiceCard(
            title = "ورود اعضای بسیج",
            description = "دسترسی به میز خدمت و امتیازات اعضا",
            path = "/basij/login",
            icon = "🛡️",
            actionTextRes = R.string.service_action_login
        ),
        ServiceCard(
            title = "ورود مدیر مسجد",
            description = "ورود به داشبورد مدیریتی و آمار مسجد",
            path = "/auth/login",
            icon = "🛠️",
            actionTextRes = R.string.service_action_login
        ),
        ServiceCard(
            title = "ورود اعضا با QR",
            description = "اسکن کارت بسیج برای ورود یک‌باره",
            path = "/basij/scan",
            icon = "📷",
            type = ServiceType.BASIJ_SCAN,
            actionTextRes = R.string.service_action_scan
        )
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentServicesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.swipeRefresh.setOnRefreshListener {
            renderCards()
            binding.swipeRefresh.isRefreshing = false
        }
        renderCards()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun renderCards() {
        binding.serviceCardsContainer.removeAllViews()
        val inflater = layoutInflater
        services.forEach { service ->
            val card = inflater.inflate(R.layout.view_service_item, binding.serviceCardsContainer, false)
            card.findViewById<android.widget.TextView>(R.id.serviceIcon).text = service.icon
            card.findViewById<android.widget.TextView>(R.id.serviceTitle).text = service.title
            card.findViewById<android.widget.TextView>(R.id.serviceDescription).text = service.description
            card.findViewById<android.widget.TextView>(R.id.serviceHint).text =
                getString(service.actionTextRes)

            val clickListener = View.OnClickListener {
                when (service.type) {
                    ServiceType.WEB -> openWebPath(service)
                    ServiceType.BASIJ_SCAN -> openBasijScanner()
                }
            }
            card.setOnClickListener(clickListener)
            card.findViewById<View>(R.id.serviceHint).setOnClickListener(clickListener)
            binding.serviceCardsContainer.addView(card)
        }
    }

    private fun openWebPath(service: ServiceCard) {
        val targetPath = service.path
        if (targetPath.isBlank()) return
        val args = bundleOf(
            WebPageFragment.ARG_TITLE to service.title,
            WebPageFragment.ARG_PATH to appendInAppParams(targetPath),
            WebPageFragment.ARG_FORCE_LOGOUT to service.clearCookiesBeforeLoad
        )
        findNavController().navigate(R.id.nav_web_page, args)
    }

    private fun openBasijScanner() {
        findNavController().navigate(R.id.nav_basij_scan)
    }

    private fun appendInAppParams(path: String): String {
        if (path.isBlank()) return path
        val separator = if (path.contains("?")) "&" else "?"
        val baseParams = "inApp=1&source=android"
        return buildString {
            append(path)
            append(separator)
            append(baseParams)
        }
    }
}

data class ServiceCard(
    val title: String,
    val description: String,
    val path: String,
    val icon: String,
    val type: ServiceType = ServiceType.WEB,
    @StringRes val actionTextRes: Int = R.string.service_action_login,
    val clearCookiesBeforeLoad: Boolean = false
)

enum class ServiceType { WEB, BASIJ_SCAN }
