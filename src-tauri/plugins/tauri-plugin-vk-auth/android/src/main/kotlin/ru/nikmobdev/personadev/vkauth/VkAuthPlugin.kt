package ru.nikmobdev.personadev.vkauth

import android.app.Activity
import android.os.Handler
import android.os.Looper
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import androidx.appcompat.app.AppCompatActivity
import com.vk.id.AccessToken
import com.vk.id.VKID
import com.vk.id.VKIDAuthFail
import com.vk.id.auth.AuthCodeData
import com.vk.id.auth.VKIDAuthCallback
import com.vk.id.auth.VKIDAuthParams

@TauriPlugin
class VkAuthPlugin(private val activity: Activity) : Plugin(activity) {

    private var cachedUser: JSObject? = null

    @Command
    fun startVkAuth(invoke: Invoke) {
        val result = JSObject()
        result.put("started", true)
        invoke.resolve(result)

        Handler(Looper.getMainLooper()).post {
            val appCompatActivity = activity as? AppCompatActivity
            if (appCompatActivity == null) {
                val errorPayload = JSObject()
                errorPayload.put("success", false)
                errorPayload.put("error", "Activity is not AppCompatActivity")
                trigger("vk-auth-result", errorPayload)
                return@post
            }

            val callback = object : VKIDAuthCallback {
                override fun onAuth(accessToken: AccessToken) {
                    val user = accessToken.userData
                    val userObj = JSObject()
                    userObj.put("id", accessToken.userID)
                    userObj.put("first_name", user.firstName)
                    userObj.put("last_name", user.lastName)
                    userObj.put("photo_100", user.photo200 ?: user.photo100 ?: user.photo50 ?: "")
                    userObj.put("email", user.email ?: "")

                    cachedUser = userObj

                    val successPayload = JSObject()
                    successPayload.put("success", true)
                    successPayload.put("user", userObj)
                    trigger("vk-auth-result", successPayload)
                }

                override fun onAuthCode(data: AuthCodeData, isCompletion: Boolean) {
                    // SDK handles code exchange internally
                }

                override fun onFail(fail: VKIDAuthFail) {
                    val errorMsg = when (fail) {
                        is VKIDAuthFail.Canceled -> "User cancelled"
                        is VKIDAuthFail.FailedApiCall -> "API error: ${fail.description}"
                        is VKIDAuthFail.FailedOAuth -> "OAuth error: ${fail.description}"
                        is VKIDAuthFail.FailedOAuthState -> "State error: ${fail.description}"
                        is VKIDAuthFail.FailedRedirectActivity -> "Redirect error: ${fail.description}"
                        is VKIDAuthFail.NoBrowserAvailable -> "No browser available"
                    }
                    val errorPayload = JSObject()
                    errorPayload.put("success", false)
                    errorPayload.put("error", errorMsg)
                    trigger("vk-auth-result", errorPayload)
                }
            }

            VKID.instance.authorize(
                lifecycleOwner = appCompatActivity,
                callback = callback,
                params = VKIDAuthParams {
                    scopes = setOf("email")
                }
            )
        }
    }

    @Command
    fun getVkUser(invoke: Invoke) {
        if (cachedUser != null) {
            invoke.resolve(cachedUser)
        } else {
            invoke.resolve(JSObject())
        }
    }
}
