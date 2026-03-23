const COMMANDS: &[&str] = &["get_products", "purchase_product", "get_purchases", "confirm_purchase", "check_premium_status"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .build();
}
