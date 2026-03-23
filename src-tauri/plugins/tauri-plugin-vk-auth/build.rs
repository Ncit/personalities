const COMMANDS: &[&str] = &["start_vk_auth", "get_vk_user", "register_listener"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .build();
}
