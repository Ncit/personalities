package ru.nikmobdev.personadev.vkauth

import android.app.Activity
import android.content.Intent
import android.net.Uri
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL

@TauriPlugin
class VkAuthPlugin(private val activity: Activity) : Plugin(activity) {

    private var cachedUser: Map<String, Any?>? = null

    companion object {
        private const val VK_APP_ID = "53942833"
        private const val REDIRECT_URI = "personadev://auth"
        private const val VK_AUTH_URL = "https://id.vk.com/authorize"
    }

    @Command
    fun startVkAuth(invoke: Invoke) {
        val authUrl = "$VK_AUTH_URL?" +
            "client_id=$VK_APP_ID" +
            "&redirect_uri=$REDIRECT_URI" +
            "&response_type=code" +
            "&scope=email" +
            "&state=vk_auth"

        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(authUrl))
            activity.startActivity(intent)
            invoke.resolve(mapOf("started" to true))
        } catch (e: Exception) {
            invoke.reject("Failed to open VK auth: ${e.message}")
        }
    }

    @Command
    fun getVkUser(invoke: Invoke) {
        if (cachedUser != null) {
            invoke.resolve(cachedUser)
        } else {
            invoke.resolve(null)
        }
    }

    override fun onNewIntent(intent: Intent) {
        val uri = intent.data ?: return
        if (uri.scheme != "personadev" || uri.host != "auth") return

        val code = uri.getQueryParameter("code") ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Exchange code for token via backend
                // Exchange code via backend
                val tokenUrl = "https://nikmobdev.ru/goodsshop/api/vk/exchange-code?code=$code"
                val connection = URL(tokenUrl).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                val response = connection.inputStream.bufferedReader().readText()

                val json = org.json.JSONObject(response)
                cachedUser = mapOf(
                    "id" to json.getLong("id"),
                    "firstName" to json.getString("first_name"),
                    "lastName" to json.getString("last_name"),
                    "photoUrl" to json.optString("photo_url", null)
                )

                trigger("vk-auth-result", mapOf(
                    "success" to true,
                    "user" to cachedUser
                ))
            } catch (e: Exception) {
                trigger("vk-auth-result", mapOf(
                    "success" to false,
                    "error" to (e.message ?: "Auth failed")
                ))
            }
        }
    }
}
