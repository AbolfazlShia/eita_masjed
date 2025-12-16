package com.masjed.app.ui.web

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.masjed.app.R
import com.masjed.app.databinding.FragmentWebPageBinding
import com.masjed.app.storage.DeskOrigin
import com.masjed.app.storage.DeskShortcut
import com.masjed.app.storage.DeskShortcutStorage
import com.masjed.app.storage.SecureStorage
import com.masjed.app.ui.common.DeskShortcutViewModel
import com.masjed.app.util.NetworkUtils
import com.masjed.app.util.UrlUtils
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale

class WebPageFragment : Fragment(R.layout.fragment_web_page) {

    private enum class OfflineReason { NETWORK, SERVER }

    private var _binding: FragmentWebPageBinding? = null
    private val binding get() = _binding!!
    private val mainHandler = Handler(Looper.getMainLooper())

    private val pageTitle: String by lazy { arguments?.getString(ARG_TITLE).orEmpty() }
    private val pagePath: String by lazy { arguments?.getString(ARG_PATH).orEmpty() }
    private val cookieManager: CookieManager by lazy { CookieManager.getInstance() }
    private val baseWebUrl: String by lazy { UrlUtils.baseWebUrl() }
    private val baseCookieUrl: String by lazy {
        val uri = Uri.parse(baseWebUrl)
        "${uri.scheme ?: "https"}://${uri.host.orEmpty()}"
    }
    private val authMode: AuthMode by lazy { determineAuthMode(pagePath) }
    private val forceLogout: Boolean by lazy { arguments?.getBoolean(ARG_FORCE_LOGOUT, false) ?: false }
    private val deskShortcutViewModel: DeskShortcutViewModel by activityViewModels()
    private val launchedFromDeskShortcut: Boolean by lazy { arguments?.getBoolean(ARG_FROM_DESK_SHORTCUT, false) ?: false }
    private val debugLogs = mutableListOf<String>()
    private val timeFormatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    private var debugPanelVisible = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWebPageBinding.inflate(inflater, container, false)
        return binding.root
    }
    private fun clearPersistedCookies() {
        val cookiesToClear = persistentCookieNames()
        if (cookiesToClear.isEmpty()) return
        cookiesToClear.forEach { name ->
            SecureStorage.remove(cookieStorageKey(name))
            cookieManager.setCookie(
                baseCookieUrl,
                "$name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
            )
        }
        cookieManager.flush()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar()
        setupWebView()
        setupRetry()
        setupDebugPanel()
        if (forceLogout) {
            clearPersistedCookies()
        }
        prepareCookies()
        attemptLoad()

        requireActivity().onBackPressedDispatcher.addCallback(
            viewLifecycleOwner,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    navigateBack()
                }
            }
        )
    }

    override fun onDestroyView() {
        reloginDialog?.dismiss()
        reloginDialog = null
        binding.webContent.apply {
            stopLoading()
            webViewClient = object : WebViewClient() {}
            loadUrl("about:blank")
            destroy()
        }
        _binding = null
        super.onDestroyView()
    }

    private fun setupToolbar() {
        binding.toolbar.title = if (pageTitle.isBlank()) getString(R.string.app_name) else pageTitle
        binding.toolbar.setNavigationOnClickListener { navigateBack() }
        binding.toolbar.setOnLongClickListener {
            toggleDebugPanel(!debugPanelVisible)
            true
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webContent.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mediaPlaybackRequiresUserGesture = false
            settings.setSupportZoom(true)
            settings.builtInZoomControls = true
            settings.displayZoomControls = false
            @Suppress("DEPRECATION")
            settings.layoutAlgorithm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
            } else {
                WebSettings.LayoutAlgorithm.NORMAL
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            }
            addJavascriptInterface(DeskBridgeHandler(), "MasjedBridge")
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        appendDebugLog(
                            "console [${it.messageLevel()}] ${it.sourceId()}:${it.lineNumber()} → ${it.message()}",
                            autoShow = it.messageLevel() == ConsoleMessage.MessageLevel.ERROR
                        )
                    }
                    return super.onConsoleMessage(consoleMessage)
                }
            }
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val target = request?.url ?: return false
                    if (target.scheme == "masjed" && target.host == "home") {
                        navigateHomeDirect()
                        return true
                    }
                    if (UrlUtils.webHostMatches(target)) {
                        return false
                    }
                    return true
                }

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    binding.progressBar.visibility = View.VISIBLE
                    showOffline(null)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    binding.progressBar.visibility = View.GONE
                    if (shouldPersistCookies()) {
                        persistCookies(url)
                    }
                    injectDebugBridge()
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    if (request?.isForMainFrame != false) {
                        binding.progressBar.visibility = View.GONE
                        view?.apply {
                            stopLoading()
                            loadUrl("about:blank")
                        }
                        showOffline(determineOfflineReason())
                        appendDebugLog("صفحه اصلی دچار خطا شد: ${error?.description}", autoShow = true)
                    } else {
                        appendDebugLog(
                            "منبع ${request?.url} بارگذاری نشد: ${error?.description}",
                            autoShow = true
                        )
                    }
                }

                override fun onReceivedHttpError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    errorResponse: WebResourceResponse?
                ) {
                    if (request?.isForMainFrame != false) {
                        binding.progressBar.visibility = View.GONE
                        view?.stopLoading()
                        showOffline(OfflineReason.SERVER)
                        appendDebugLog(
                            "HTTP ${errorResponse?.statusCode} برای صفحه اصلی",
                            autoShow = true
                        )
                    } else {
                        appendDebugLog(
                            "HTTP ${errorResponse?.statusCode} برای ${request?.url}",
                            autoShow = true
                        )
                    }
                }
            }
        }
    }

    private fun attemptLoad() {
        if (!isAdded) return
        if (!NetworkUtils.isOnline(requireContext())) {
            showOffline(OfflineReason.NETWORK)
            return
        }
        binding.progressBar.visibility = View.VISIBLE
        showOffline(null)
        loadUrl()
    }

    private fun loadUrl() {
        val finalUrl = UrlUtils.buildWebUrl(pagePath)
        Log.d("WebPageFragment", "Loading URL: $finalUrl")
        appendDebugLog("Loading $finalUrl")
        binding.webContent.loadUrl(finalUrl)
    }

    private fun setupRetry() {
        binding.buttonRetry.setOnClickListener {
            attemptLoad()
        }
    }

    private fun setupDebugPanel() {
        binding.buttonCloseDebug.setOnClickListener {
            toggleDebugPanel(false)
        }
        binding.debugPanel.setOnClickListener { /* block clicks from passing through */ }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun injectDebugBridge() {
        val script = """
            (function() {
                if (window.__masjedDebugHookInstalled) {
                    try {
                        if (typeof window.__masjedDumpState === 'function') {
                            window.__masjedDumpState('refresh');
                        }
                    } catch (_) {}
                    return;
                }
                window.__masjedDebugHookInstalled = true;
                var log = function(level, msg) {
                    try {
                        console[level]('[masjed-debug] ' + msg);
                    } catch (err) {
                        console.error('[masjed-debug] failed to log message: ' + err);
                    }
                };
                function capturePanelState(context) {
                    var surface = document.querySelector('[data-devotional-panel=\"surface\"]');
                    var scroll = document.querySelector('[data-devotional-scroll=\"content\"]');
                    if (!surface || !scroll) {
                        log('log', 'panel(' + context + '): missing surface=' + !!surface + ', scroll=' + !!scroll);
                        return false;
                    }
                    var surfaceStyle = window.getComputedStyle(surface);
                    var scrollStyle = window.getComputedStyle(scroll);
                    log('log', 'panel(' + context + '): surfaceBg=' + surfaceStyle.backgroundImage + ', surfaceColor=' + surfaceStyle.backgroundColor + ', surfaceShadow=' + surfaceStyle.boxShadow);
                    log('log', 'panel(' + context + '): scrollBg=' + scrollStyle.backgroundImage + ', scrollColor=' + scrollStyle.backgroundColor + ', font=' + scrollStyle.fontFamily);
                    var gradientSupport = surfaceStyle.backgroundImage && surfaceStyle.backgroundImage.indexOf('gradient') !== -1;
                    log('log', 'panel(' + context + '): gradientSupport=' + gradientSupport + ', scrollHeight=' + scroll.scrollHeight + ', clientHeight=' + scroll.clientHeight);
                    return true;
                }

                window.__masjedDumpState = function(context) {
                    try {
                        var sheets = Array.prototype.map.call(document.styleSheets || [], function(sheet) {
                            var href = sheet.href || 'inline';
                            return href;
                        });
                        log('log', 'state(' + context + '): ua=' + navigator.userAgent + ', sheets=' + sheets.join(' | '));
                        var bodyBg = window.getComputedStyle(document.body || document.documentElement).backgroundImage;
                        log('log', 'state(' + context + '): bodyBg=' + bodyBg);
                        capturePanelState(context);
                    } catch (err) {
                        log('error', 'state(' + context + ') failed: ' + err);
                    }
                };
                window.__masjedDumpState('initial');
                window.addEventListener('error', function(event) {
                    try {
                        if (event.target && event.target !== window && event.target.tagName) {
                            var url = event.target.src || event.target.href || event.target.currentSrc || '';
                            log('error', 'resource error tag=' + event.target.tagName + ', url=' + url);
                        } else {
                            log('error', 'js error message=' + event.message + ' at ' + event.filename + ':' + event.lineno + ':' + event.colno);
                        }
                    } catch (err) {
                        log('error', 'listener error: ' + err);
                    }
                }, true);
                window.addEventListener('load', function() {
                    window.__masjedDumpState('load');
                });
                var panelWatcherAttempts = 0;
                var panelWatcher = setInterval(function() {
                    panelWatcherAttempts++;
                    var context = 'watch' + panelWatcherAttempts;
                    var captured = false;
                    try {
                        captured = capturePanelState(context);
                    } catch (err) {
                        log('error', 'panel(' + context + ') failed: ' + err);
                    }
                    if (captured || panelWatcherAttempts >= 20) {
                        clearInterval(panelWatcher);
                    }
                }, 600);
            })();
        """.trimIndent()
        binding.webContent.evaluateJavascript(script, null)
    }

    private fun toggleDebugPanel(show: Boolean) {
        if (debugPanelVisible == show) return
        debugPanelVisible = show
        binding.debugPanel.visibility = if (show) View.VISIBLE else View.GONE
        binding.webContent.visibility = if (show) View.GONE else View.VISIBLE
        if (show) {
            binding.offlineContainer.visibility = View.GONE
            binding.progressBar.visibility = View.GONE
        }
    }

    private fun appendDebugLog(message: String, autoShow: Boolean = false) {
        val timestamp = timeFormatter.format(System.currentTimeMillis())
        val entry = "[$timestamp] $message"
        debugLogs.add(entry)
        if (debugLogs.size > 200) {
            debugLogs.removeAt(0)
        }
        binding.debugLog.text = debugLogs.joinToString("\n")
        if (autoShow) {
            toggleDebugPanel(true)
        }
    }

    private fun showOffline(reason: OfflineReason?) {
        val visible = reason != null
        binding.offlineContainer.visibility = if (visible) View.VISIBLE else View.GONE
        binding.webContent.visibility = if (visible) View.GONE else View.VISIBLE
        if (!visible) return

        binding.progressBar.visibility = View.GONE
        val (titleRes, bodyRes) = when (reason) {
            OfflineReason.NETWORK -> R.string.web_offline_title to R.string.web_offline_body
            OfflineReason.SERVER -> R.string.web_server_error_title to R.string.web_server_error_body
            null -> R.string.web_offline_title to R.string.web_offline_body
        }
        binding.textOfflineTitle.setText(titleRes)
        binding.textOfflineBody.setText(bodyRes)
    }

    private fun determineOfflineReason(): OfflineReason {
        return if (NetworkUtils.isOnline(requireContext())) OfflineReason.SERVER else OfflineReason.NETWORK
    }

    private fun navigateBack() {
        val navController = findNavController()
        val targetDest = if (launchedFromDeskShortcut) R.id.nav_services else R.id.nav_home
        if (!navController.popBackStack(targetDest, false)) {
            navController.navigate(targetDest)
        }
    }

    private fun navigateToServices() {
        val navController = findNavController()
        if (!navController.popBackStack(R.id.nav_services, false)) {
            navController.navigate(R.id.nav_services)
        }
    }

    private fun navigateHomeDirect() {
        val navController = findNavController()
        if (!navController.popBackStack(R.id.nav_home, false)) {
            navController.navigate(R.id.nav_home)
        }
    }

    private fun exitApplication() {
        activity?.let {
            it.finishAffinity()
            it.finishAndRemoveTask()
        }
    }

    private var reloginDialog: AlertDialog? = null

    private fun prepareCookies() {
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webContent, true)
        if (!shouldPersistCookies()) {
            return
        }
        persistentCookieNames().forEach { name ->
            SecureStorage.getString(cookieStorageKey(name))?.takeIf { it.isNotBlank() }?.let { value ->
                cookieManager.setCookie(baseCookieUrl, "$name=$value; Path=/")
            }
        }
        cookieManager.flush()
    }

    private fun persistCookies(url: String?) {
        val cookies = cookieManager.getCookie(url ?: baseCookieUrl) ?: return
        val cookieMap = cookies.split(";").mapNotNull { pair ->
            val parts = pair.split("=", limit = 2)
            if (parts.size == 2) parts[0].trim() to parts[1].trim() else null
        }.toMap()
        persistentCookieNames().forEach { name ->
            cookieMap[name]?.let { value ->
                SecureStorage.putString(cookieStorageKey(name), value)
            }
        }
        cookieManager.flush()
    }

    private fun cookieStorageKey(name: String) = "cookie_${name}_${Uri.parse(baseWebUrl).host.orEmpty()}"

    private fun shouldPersistCookies(): Boolean = persistentCookieNames().isNotEmpty()

    private fun persistentCookieNames(): List<String> = when (authMode) {
        AuthMode.BASIJ -> listOf("basij_session")
        AuthMode.ADMIN -> listOf("session")
        AuthMode.DEFAULT, AuthMode.BASIJ_QR -> emptyList()
    }

    private inner class DeskBridgeHandler {
        @JavascriptInterface
        fun postMessage(payload: String?) {
            if (payload.isNullOrBlank()) return
            runCatching {
                val json = JSONObject(payload)
                when (json.optString("type")) {
                    "setDeskShortcut" -> handleSetShortcut(json)
                    "clearDeskShortcut" -> handleClearShortcut()
                    "exitApp" -> exitApplication()
                    "ackDeskExit" -> handleAckDeskExit(json)
                }
            }.onFailure {
                Log.e("DeskBridgeHandler", "Failed to handle payload: $payload", it)
            }
        }

        private fun handleSetShortcut(json: JSONObject) {
            val shortcutJson = json.optJSONObject("shortcut") ?: return
            val title = shortcutJson.optString("title").takeIf { it.isNotBlank() } ?: return
            val path = shortcutJson.optString("path").takeIf { it.isNotBlank() } ?: return
            val originName = shortcutJson.optString("origin").takeIf { it.isNotBlank() } ?: return
            val origin = runCatching { DeskOrigin.valueOf(originName.uppercase()) }.getOrNull() ?: return
            val persistent = shortcutJson.optBoolean("persistent", true)
            val shortcut = DeskShortcut(
                title = title,
                path = path,
                origin = origin,
                persistent = persistent
            )
            mainHandler.post {
                deskShortcutViewModel.setShortcut(shortcut)
                when (shortcut.origin) {
                    DeskOrigin.ADMIN -> if (!DeskShortcutStorage.hasExitAck(DeskOrigin.ADMIN)) {
                        showManagerReopenDialog()
                    }
                    DeskOrigin.BASIJ -> if (!DeskShortcutStorage.hasExitAck(DeskOrigin.BASIJ)) {
                        showBasijReopenDialog()
                    }
                }
            }
        }

        private fun handleClearShortcut() {
            mainHandler.post {
                clearPersistedCookies()
                deskShortcutViewModel.clearShortcut()
                exitApplication()
            }
        }

        private fun handleAckDeskExit(json: JSONObject) {
            val originName = json.optString("origin").takeIf { it.isNotBlank() } ?: return
            val origin = runCatching { DeskOrigin.valueOf(originName.uppercase()) }.getOrNull() ?: return
            mainHandler.post {
                DeskShortcutStorage.markExitAck(origin)
            }
        }
    }

    private fun showManagerReopenDialog() {
        if (!isAdded) {
            exitApplication()
            return
        }
        reloginDialog?.dismiss()
        val dialog = AlertDialog.Builder(requireContext())
            .setTitle(R.string.manager_relogin_title)
            .setMessage(R.string.manager_relogin_message)
            .setPositiveButton(R.string.manager_relogin_action) { _, _ ->
                DeskShortcutStorage.markExitAck(DeskOrigin.ADMIN)
                exitApplication()
            }
            .setCancelable(false)
            .create()
        reloginDialog = dialog
        dialog.show()
    }

    private fun showBasijReopenDialog() {
        if (!isAdded) {
            exitApplication()
            return
        }
        reloginDialog?.dismiss()
        val dialog = AlertDialog.Builder(requireContext())
            .setTitle(R.string.basij_relogin_title)
            .setMessage(R.string.basij_relogin_message)
            .setPositiveButton(R.string.basij_relogin_action) { _, _ ->
                DeskShortcutStorage.markExitAck(DeskOrigin.BASIJ)
                exitApplication()
            }
            .setCancelable(false)
            .create()
        reloginDialog = dialog
        dialog.show()
    }

    private fun determineAuthMode(path: String): AuthMode {
        val clean = path.lowercase()
        return when {
            clean.contains("/basij/scan") || clean.contains("/basij/qr") -> AuthMode.BASIJ_QR
            clean.contains("/basij") -> AuthMode.BASIJ
            clean.contains("/manager") || clean.contains("/auth") -> AuthMode.ADMIN
            else -> AuthMode.DEFAULT
        }
    }

    private enum class AuthMode { DEFAULT, BASIJ, ADMIN, BASIJ_QR }

    companion object {
        const val ARG_TITLE = "arg_title"
        const val ARG_PATH = "arg_path"
        const val ARG_FORCE_LOGOUT = "arg_force_logout"
        const val ARG_FROM_DESK_SHORTCUT = "arg_from_desk_shortcut"
    }
}
