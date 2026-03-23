use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "ru.nikmobdev.personadev.rustore";

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("rustore-pay")
        .setup(|app, _api| {
            #[cfg(target_os = "android")]
            {
                _api.register_android_plugin(PLUGIN_IDENTIFIER, "RuStorePayPlugin")?;
            }
            Ok(())
        })
        .build()
}
