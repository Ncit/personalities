use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub product_id: String,
    pub title: String,
    pub price: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PurchaseResult {
    pub success: bool,
    pub purchase_id: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Purchase {
    pub product_id: String,
    pub purchase_id: String,
    pub state: String,
}

// Desktop stubs — real implementation is in Kotlin for Android
#[tauri::command]
async fn get_products() -> Result<Vec<Product>, String> {
    Ok(vec![Product {
        product_id: "premium".to_string(),
        title: "Premium".to_string(),
        price: "150 ₽".to_string(),
    }])
}

#[tauri::command]
async fn purchase_product(product_id: String) -> Result<PurchaseResult, String> {
    let _ = product_id;
    Ok(PurchaseResult {
        success: true,
        purchase_id: Some("mock-purchase-id".to_string()),
        error: None,
    })
}

#[tauri::command]
async fn get_purchases() -> Result<Vec<Purchase>, String> {
    Ok(vec![])
}

#[tauri::command]
async fn confirm_purchase(purchase_id: String) -> Result<(), String> {
    let _ = purchase_id;
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("rustore-pay")
        .invoke_handler(tauri::generate_handler![
            get_products,
            purchase_product,
            get_purchases,
            confirm_purchase,
        ])
        .build()
}
