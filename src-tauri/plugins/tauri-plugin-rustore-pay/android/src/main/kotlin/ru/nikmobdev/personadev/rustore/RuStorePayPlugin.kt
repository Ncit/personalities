package ru.nikmobdev.personadev.rustore

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import ru.rustore.sdk.pay.RuStorePay
import ru.rustore.sdk.pay.model.PaymentResult

@InvokeArg
internal class PurchaseArgs {
    lateinit var productId: String
}

@InvokeArg
internal class ConfirmArgs {
    lateinit var purchaseId: String
}

@TauriPlugin
class RuStorePayPlugin(private val activity: Activity) : Plugin(activity) {

    override fun load(webView: android.webkit.WebView) {
        super.load(webView)
        RuStorePay.init(
            application = activity.application,
            consoleApplicationId = "ru.nikmobdev.personadev",
            deeplinkScheme = "personadev"
        )
    }

    @Command
    fun getProducts(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val products = RuStorePay.getProducts(listOf("premium"))
                val result = products.map { product ->
                    mapOf(
                        "productId" to product.productId,
                        "title" to product.title,
                        "price" to product.price
                    )
                }
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to get products")
            }
        }
    }

    @Command
    fun purchaseProduct(invoke: Invoke) {
        val args = invoke.parseArgs(PurchaseArgs::class.java)
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = RuStorePay.purchaseOneStep(
                    productId = args.productId,
                    quantity = 1
                )
                when (result) {
                    is PaymentResult.Success -> {
                        invoke.resolve(mapOf(
                            "success" to true,
                            "purchaseId" to result.purchaseId
                        ))
                    }
                    is PaymentResult.Cancelled -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to "cancelled"
                        ))
                    }
                    is PaymentResult.Failure -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to (result.errorMessage ?: "Payment failed")
                        ))
                    }
                    else -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to "Unknown payment result"
                        ))
                    }
                }
            } catch (e: Exception) {
                invoke.resolve(mapOf(
                    "success" to false,
                    "error" to (e.message ?: "Purchase failed")
                ))
            }
        }
    }

    @Command
    fun getPurchases(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val purchases = RuStorePay.getPurchases()
                val result = purchases.map { purchase ->
                    mapOf(
                        "productId" to purchase.productId,
                        "purchaseId" to purchase.purchaseId,
                        "state" to purchase.purchaseState.name
                    )
                }
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to get purchases")
            }
        }
    }

    @Command
    fun confirmPurchase(invoke: Invoke) {
        val args = invoke.parseArgs(ConfirmArgs::class.java)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                RuStorePay.confirmPurchase(args.purchaseId)
                invoke.resolve(mapOf("success" to true))
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to confirm purchase")
            }
        }
    }
}
