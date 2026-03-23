package ru.nikmobdev.personadev.rustore

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.JSArray
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import ru.rustore.sdk.billingclient.RuStoreBillingClient
import ru.rustore.sdk.billingclient.RuStoreBillingClientFactory
import ru.rustore.sdk.billingclient.model.purchase.PaymentResult
import ru.rustore.sdk.billingclient.model.purchase.PurchaseState

@InvokeArg
internal class PurchaseArgs {
    lateinit var productId: String
}

@InvokeArg
internal class ConfirmArgs {
    lateinit var purchaseId: String
}

@InvokeArg
internal class GetProductsArgs {
    var productIds: List<String>? = null
}

@TauriPlugin
class RuStorePayPlugin(private val activity: Activity) : Plugin(activity) {

    private lateinit var billingClient: RuStoreBillingClient

    override fun load(webView: android.webkit.WebView) {
        super.load(webView)
        billingClient = RuStoreBillingClientFactory.create(
            context = activity.application,
            consoleApplicationId = "2063702872",
            deeplinkScheme = "personadev",
            debugLogs = true
        )
    }

    @Command
    fun getProducts(invoke: Invoke) {
        val args = invoke.parseArgs(GetProductsArgs::class.java)
        val productIds = args.productIds ?: listOf("premium")

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val products = billingClient.products.getProducts(productIds).await()
                val arr = JSArray()
                for (product in products) {
                    val p = JSObject()
                    p.put("productId", product.productId)
                    p.put("title", product.title ?: "")
                    p.put("price", product.priceLabel ?: "")
                    arr.put(p)
                }
                val result = JSObject()
                result.put("products", arr)
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject("getProducts failed: ${e.message}")
            }
        }
    }

    @Command
    fun purchaseProduct(invoke: Invoke) {
        val args = invoke.parseArgs(PurchaseArgs::class.java)

        billingClient.purchases.purchaseProduct(args.productId)
            .addOnSuccessListener { paymentResult: PaymentResult ->
                when (paymentResult) {
                    is PaymentResult.Success -> {
                        val purchaseId = paymentResult.purchaseId
                        billingClient.purchases.confirmPurchase(purchaseId)
                            .addOnSuccessListener {
                                val result = JSObject()
                                result.put("success", true)
                                result.put("purchaseId", purchaseId)
                                invoke.resolve(result)
                            }
                            .addOnFailureListener { err: Throwable ->
                                val result = JSObject()
                                result.put("success", true)
                                result.put("purchaseId", purchaseId)
                                result.put("confirmError", err.message)
                                invoke.resolve(result)
                            }
                    }
                    is PaymentResult.Failure -> {
                        invoke.reject("Purchase failed")
                    }
                    is PaymentResult.Cancelled -> {
                        invoke.reject("Purchase cancelled by user")
                    }
                    else -> {
                        invoke.reject("Unknown payment result")
                    }
                }
            }
            .addOnFailureListener { e: Throwable ->
                invoke.reject("purchaseProduct failed: ${e.message}")
            }
    }

    @Command
    fun getPurchases(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val purchases = billingClient.purchases.getPurchases().await()
                val arr = JSArray()
                for (purchase in purchases) {
                    val p = JSObject()
                    p.put("productId", purchase.productId)
                    p.put("purchaseId", purchase.purchaseId ?: "")
                    p.put("state", purchase.purchaseState?.name ?: "UNKNOWN")
                    arr.put(p)
                }
                val result = JSObject()
                result.put("purchases", arr)
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject("getPurchases failed: ${e.message}")
            }
        }
    }

    @Command
    fun confirmPurchase(invoke: Invoke) {
        val args = invoke.parseArgs(ConfirmArgs::class.java)

        billingClient.purchases.confirmPurchase(args.purchaseId)
            .addOnSuccessListener {
                val result = JSObject()
                result.put("confirmed", true)
                invoke.resolve(result)
            }
            .addOnFailureListener { e: Throwable ->
                invoke.reject("confirmPurchase failed: ${e.message}")
            }
    }

    @Command
    fun checkPremiumStatus(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val purchases = billingClient.purchases.getPurchases().await()
                val hasPremium = purchases.any { purchase ->
                    purchase.productId == "premium" &&
                    (purchase.purchaseState == PurchaseState.PAID ||
                     purchase.purchaseState == PurchaseState.CONFIRMED)
                }

                // Auto-confirm PAID purchases
                for (purchase in purchases) {
                    if (purchase.productId == "premium" && purchase.purchaseState == PurchaseState.PAID) {
                        val pid = purchase.purchaseId ?: continue
                        try {
                            billingClient.purchases.confirmPurchase(pid).await()
                        } catch (_: Exception) {}
                    }
                }

                val result = JSObject()
                result.put("premium", hasPremium)
                invoke.resolve(result)
            } catch (e: Exception) {
                val result = JSObject()
                result.put("premium", false)
                invoke.resolve(result)
            }
        }
    }
}
