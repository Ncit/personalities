package ru.nikmobdev.personadev

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import ru.rustore.sdk.pay.RuStorePayClient
import ru.rustore.sdk.pay.model.SdkTheme

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    if (savedInstanceState == null) {
      RuStorePayClient.instance.getIntentInteractor().proceedIntent(intent, sdkTheme = SdkTheme.LIGHT)
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    RuStorePayClient.instance.getIntentInteractor().proceedIntent(intent, sdkTheme = SdkTheme.LIGHT)
  }
}
