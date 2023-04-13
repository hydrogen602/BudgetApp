use crate::transfer_data::IncomeAndExpensesJson;

#[tauri::command]
pub fn save_to_disk(path: String, data: IncomeAndExpensesJson) -> Result<(), String> {
    data.save(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_from_disk(path: String) -> Result<IncomeAndExpensesJson, String> {
    IncomeAndExpensesJson::load(path).map_err(|e| e.to_string())
}
