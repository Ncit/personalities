use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VkUser {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub photo_url: Option<String>,
}

// Desktop stubs — real implementation is in Kotlin for Android
#[tauri::command]
async fn start_vk_auth() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
async fn get_vk_user() -> Result<Option<VkUser>, String> {
    Ok(None)
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vk-auth")
        .invoke_handler(tauri::generate_handler![start_vk_auth, get_vk_user])
        .build()
}
