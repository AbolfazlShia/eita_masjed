package com.masjed.app.ui.basij

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.google.android.material.textfield.TextInputEditText
import com.google.zxing.BinaryBitmap
import com.google.zxing.ChecksumException
import com.google.zxing.FormatException
import com.google.zxing.MultiFormatReader
import com.google.zxing.NotFoundException
import com.google.zxing.ResultPoint
import com.google.zxing.RGBLuminanceSource
import com.google.zxing.common.HybridBinarizer
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.masjed.app.BuildConfig
import com.masjed.app.R
import com.masjed.app.databinding.FragmentBasijScanBinding
import com.masjed.app.storage.DeskOrigin
import com.masjed.app.storage.DeskShortcut
import com.masjed.app.ui.web.WebPageFragment
import com.masjed.app.ui.common.DeskShortcutViewModel
import com.masjed.app.util.UrlUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedOutputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class BasijScanFragment : Fragment(R.layout.fragment_basij_scan) {

    private var _binding: FragmentBasijScanBinding? = null
    private val binding get() = _binding!!

    private val cookieManager: CookieManager by lazy { CookieManager.getInstance() }
    private val baseWebUrl: String by lazy { UrlUtils.baseWebUrl() }
    private val baseCookieUrl: String by lazy {
        val uri = Uri.parse(baseWebUrl)
        "${uri.scheme ?: "https"}://${uri.host.orEmpty()}"
    }
    private val deskShortcutViewModel: DeskShortcutViewModel by activityViewModels()

    private var isProcessing = false
    private val barcodeCallback = object : BarcodeCallback {
        override fun barcodeResult(result: BarcodeResult?) {
            val token = result?.text?.trim().orEmpty()
            if (token.isNotBlank()) {
                binding.scannerView.pause()
                handleToken(token, TokenSource.CAMERA)
            } else {
                resumeScannerWithDelay()
            }
        }

        override fun possibleResultPoints(resultPoints: MutableList<ResultPoint>?) = Unit
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            startScanner()
        } else {
            updateStatus(getString(R.string.camera_permission_required))
        }
    }

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let { decodeFromImage(it) }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBasijScanBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.scannerView.decodeContinuous(barcodeCallback)
        binding.buttonRetryScan.setOnClickListener { restartScanner() }
        binding.buttonPickImage.setOnClickListener { pickImageLauncher.launch("image/*") }
        binding.buttonSubmitToken.setOnClickListener { submitManualToken() }
        binding.inputToken.setOnEditorActionListener { _, _, _ ->
            submitManualToken()
            true
        }
        ensureCameraPermission()
    }

    override fun onResume() {
        super.onResume()
        if (!isProcessing && hasCameraPermission()) {
            binding.scannerView.resume()
        }
    }

    override fun onPause() {
        binding.scannerView.pause()
        super.onPause()
    }

    override fun onDestroyView() {
        binding.scannerView.pauseAndWait()
        _binding = null
        super.onDestroyView()
    }

    private fun ensureCameraPermission() {
        if (hasCameraPermission()) {
            startScanner()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun startScanner() {
        if (!hasCameraPermission()) return
        isProcessing = false
        binding.scannerView.resume()
        updateStatus(getString(R.string.scanner_ready))
    }

    private fun restartScanner() {
        if (isProcessing) return
        binding.progressSubmit.visibility = View.GONE
        binding.textError.visibility = View.GONE
        binding.scannerView.resume()
        updateStatus(getString(R.string.scanner_ready))
    }

    private fun resumeScannerWithDelay() {
        binding.scannerView.postDelayed({
            if (!isProcessing) {
                binding.scannerView.resume()
            }
        }, 900)
    }

    private fun submitManualToken() {
        val tokenInput: TextInputEditText = binding.inputToken
        val token = tokenInput.text?.toString()?.trim().orEmpty()
        if (token.isBlank()) {
            showError(getString(R.string.invalid_qr_token))
            return
        }
        handleToken(token, TokenSource.MANUAL)
    }

    private fun decodeFromImage(uri: Uri) {
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val bitmap = requireContext().contentResolver.openInputStream(uri)?.use {
                    BitmapFactory.decodeStream(it)
                }
                if (bitmap == null) {
                    withContext(Dispatchers.Main) {
                        showError(getString(R.string.unable_to_decode_image))
                    }
                    return@launch
                }
                val intArray = IntArray(bitmap.width * bitmap.height)
                bitmap.getPixels(intArray, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
                val source = RGBLuminanceSource(bitmap.width, bitmap.height, intArray)
                val binaryBitmap = BinaryBitmap(HybridBinarizer(source))
                val result = MultiFormatReader().decode(binaryBitmap)
                withContext(Dispatchers.Main) {
                    handleToken(result.text.orEmpty(), TokenSource.GALLERY)
                }
            } catch (_: NotFoundException) {
                withContext(Dispatchers.Main) {
                    showError(getString(R.string.invalid_qr_token))
                }
            } catch (_: FormatException) {
                withContext(Dispatchers.Main) {
                    showError(getString(R.string.invalid_qr_token))
                }
            } catch (_: ChecksumException) {
                withContext(Dispatchers.Main) {
                    showError(getString(R.string.invalid_qr_token))
                }
            } catch (error: Exception) {
                Log.e("BasijScanFragment", "Gallery decode failed", error)
                withContext(Dispatchers.Main) {
                    showError(getString(R.string.unable_to_decode_image))
                }
            }
        }
    }

    private fun handleToken(token: String, source: TokenSource) {
        if (token.isBlank() || isProcessing) {
            resumeScannerWithDelay()
            return
        }
        isProcessing = true
        updateStatus(
            when (source) {
                TokenSource.CAMERA -> getString(R.string.qr_processing_camera)
                TokenSource.GALLERY -> getString(R.string.qr_processing_gallery)
                TokenSource.MANUAL -> getString(R.string.qr_processing_manual)
            }
        )
        binding.progressSubmit.visibility = View.VISIBLE
        binding.textError.visibility = View.GONE

        viewLifecycleOwner.lifecycleScope.launch {
            val response = withContext(Dispatchers.IO) {
                performQrLogin(token)
            }

            if (!isAdded) return@launch

            binding.progressSubmit.visibility = View.GONE
            isProcessing = false
            if (response.success) {
                applyCookies(response.cookies)
                assignDeskShortcut()
                Toast.makeText(requireContext(), R.string.qr_login_success, Toast.LENGTH_SHORT).show()
                openDesk()
            } else {
                showError(response.error ?: getString(R.string.invalid_qr_token))
                resumeScannerWithDelay()
            }
        }
    }

    private fun performQrLogin(token: String): QrLoginResponse {
        return try {
            val apiUrl = BuildConfig.BASE_API_URL.trimEnd('/') + "/api/basij/qr-login"
            val connection = (URL(apiUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15000
                readTimeout = 15000
                doInput = true
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }
            val payload = JSONObject().put("token", token).toString()
            connection.outputStream.use { out ->
                BufferedOutputStream(out).use { buff ->
                    buff.write(payload.toByteArray())
                    buff.flush()
                }
            }
            val status = connection.responseCode
            val body = (if (status in 200..299) connection.inputStream else connection.errorStream)?.use { stream ->
                BufferedReader(InputStreamReader(stream)).use { reader -> reader.readText() }
            }.orEmpty()
            val cookies = connection.headerFields["Set-Cookie"] ?: emptyList()
            connection.disconnect()

            if (status in 200..299) {
                val ok = JSONObject(body).optBoolean("ok", false)
                if (ok) {
                    QrLoginResponse(success = true, cookies = cookies)
                } else {
                    val reason = JSONObject(body).optString("error", "invalid_token")
                    QrLoginResponse(success = false, error = reason)
                }
            } else {
                val reason = JSONObject(body).optString("error", "invalid_token")
                QrLoginResponse(success = false, error = reason)
            }
        } catch (error: Exception) {
            Log.e("BasijScanFragment", "QR login failed", error)
            QrLoginResponse(success = false, error = error.message ?: "network_error")
        }
    }

    private fun applyCookies(cookies: List<String>) {
        cookies.forEach { cookie ->
            cookieManager.setCookie(baseCookieUrl, cookie)
        }
        cookieManager.flush()
    }

    private fun openDesk() {
        binding.scannerView.pause()
        val args = bundleOf(
            WebPageFragment.ARG_TITLE to getString(R.string.basij_desk_title),
            WebPageFragment.ARG_PATH to "/basij/desk?inApp=1&source=android"
        )
        findNavController().navigate(R.id.nav_web_page, args)
    }

    private fun assignDeskShortcut() {
        val shortcut = DeskShortcut(
            title = getString(R.string.basij_desk_title),
            path = "/basij/desk?inApp=1&source=android&login=qr",
            origin = DeskOrigin.BASIJ,
            persistent = false
        )
        deskShortcutViewModel.setShortcut(shortcut)
    }

    private fun showError(message: String) {
        binding.textError.text = message
        binding.textError.visibility = View.VISIBLE
        updateStatus(message)
    }

    private fun updateStatus(message: String) {
        binding.textStatus.text = message
    }

    private enum class TokenSource {
        CAMERA, GALLERY, MANUAL
    }

    private data class QrLoginResponse(
        val success: Boolean,
        val error: String? = null,
        val cookies: List<String> = emptyList()
    )
}
