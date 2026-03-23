package ru.nikmobdev.personadev

import android.app.Application
import com.vk.id.VKID

class PersonaDevApp : Application() {
    override fun onCreate() {
        super.onCreate()
        VKID.init(this)
        VKID.logsEnabled = true
    }
}
