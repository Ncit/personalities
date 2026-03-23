use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "ru.nikmobdev.personadev.vkauth";

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("vk-auth")
        .setup(|app, _api| {
            #[cfg(target_os = "android")]
            {
                _api.register_android_plugin(PLUGIN_IDENTIFIER, "VkAuthPlugin")?;
            }
            Ok(())
        })
        .build()
}
