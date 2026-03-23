package ru.nikmobdev.personadev.rustore

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.JSArray
import app.tauri.plugin.Plugin
import ru.rustore.sdk.pay.RuStorePayClient
import ru.rustore.sdk.pay.model.ProductId
import ru.rustore.sdk.pay.model.ProductPurchaseParams
import ru.rustore.sdk.pay.model.ProductPurchaseResult
import ru.rustore.sdk.pay.model.PurchaseId
import ru.rustore.sdk.pay.model.SdkTheme

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

    @Command
    fun getProducts(invoke: Invoke) {
        val args = invoke.parseArgs(GetProductsArgs::class.java)
        val productIds = (args.productIds ?: listOf("premium")).map { ProductId(it) }

        RuStorePayClient.instance.getProductInteractor().getProducts(productIds)
            .addOnSuccessListener { products ->
                val arr = JSArray()
                for (product in products) {
                    val p = JSObject()
                    p.put("productId", product.productId?.value ?: "")
                    p.put("title", product.title ?: "")
                    p.put("price", product.amountLabel ?: "")
                    arr.put(p)
                }
                val result = JSObject()
                result.put("products", arr)
                invoke.resolve(result)
            }
            .addOnFailureListener { e: Throwable ->
                invoke.reject("getProducts failed: ${e.message}")
            }
    }

    @Command
    fun purchaseProduct(invoke: Invoke) {
        val args = invoke.parseArgs(PurchaseArgs::class.java)

        val params = ProductPurchaseParams(productId = ProductId(args.productId))

        RuStorePayClient.instance.getPurchaseInteractor().purchase(
            params = params,
            sdkTheme = SdkTheme.LIGHT
        )
            .addOnSuccessListener { purchaseResult: ProductPurchaseResult ->
                val result = JSObject()
                result.put("success", true)
                result.put("productId", purchaseResult.productId?.value ?: "")
                result.put("purchaseId", purchaseResult.purchaseId?.value ?: "")
                result.put("invoiceId", purchaseResult.invoiceId?.toString() ?: "")
                invoke.resolve(result)
            }
            .addOnFailureListener { e: Throwable ->
                invoke.reject("purchaseProduct failed: ${e.message}")
            }
    }

    @Command
    fun getPurchases(invoke: Invoke) {
        RuStorePayClient.instance.getPurchaseInteractor().getPurchases()
            .addOnSuccessListener { purchases ->
                val arr = JSArray()
                for (purchase in purchases) {
                    val p = JSObject()
                    p.put("purchaseId", purchase.purchaseId?.value ?: "")
                    p.put("invoiceId", purchase.invoiceId?.toString() ?: "")
                    p.put("status", purchase.status?.toString() ?: "UNKNOWN")
                    arr.put(p)
                }
                val result = JSObject()
                result.put("purchases", arr)
                invoke.resolve(result)
            }
            .addOnFailureListener { e: Throwable ->
                invoke.reject("getPurchases failed: ${e.message}")
            }
    }

    @Command
    fun confirmPurchase(invoke: Invoke) {
        val args = invoke.parseArgs(ConfirmArgs::class.java)

        RuStorePayClient.instance.getPurchaseInteractor().confirmTwoStepPurchase(PurchaseId(args.purchaseId))
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
        // With Pay SDK, getPurchases returns all purchases
        // A completed non-consumable purchase means premium is active
        RuStorePayClient.instance.getPurchaseInteractor().getPurchases()
            .addOnSuccessListener { purchases ->
                val hasPremium = purchases.isNotEmpty()
                val result = JSObject()
                result.put("premium", hasPremium)
                invoke.resolve(result)
            }
            .addOnFailureListener { _: Throwable ->
                val result = JSObject()
                result.put("premium", false)
                invoke.resolve(result)
            }
    }
}
