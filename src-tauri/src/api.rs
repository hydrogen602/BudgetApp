use crate::transfer_data::IncomeAndExpensesJson;

#[tauri::command]
pub fn save_to_disk(path: String, data: IncomeAndExpensesJson) -> Result<(), String> {
    data.save(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_from_disk(path: String) -> Result<IncomeAndExpensesJson, String> {
    IncomeAndExpensesJson::load(path).map_err(|e| e.to_string())
}

pub mod db_api {
    use tauri::{Runtime, State};

    use crate::{db::DBState, transfer_data::TransactionJson};

    #[tauri::command]
    /// Save transactions to the database, ignoring the id field.
    /// The id field is supposed to come from the db, but it is a placeholder before its inserted.
    pub fn save_new_transactions<R: Runtime>(
        app: tauri::AppHandle<R>,
        // window: tauri::Window<R>,
        state: State<DBState>,
        data: Vec<TransactionJson>,
    ) -> Result<(), String> {
        let path = app
            .path_resolver()
            .app_data_dir()
            .ok_or("Could not get app data directory")?;
        let path = path.join("transactions.db");
        eprintln!("db path: {:?}", path);

        let conn = state.get_connection(&path).map_err(|e| e.to_string())?;

        let mut stmt = conn.prepare(
            "INSERT INTO transactions (date, description, amount, category) VALUES (?, ?, ?, ?)",
        ).map_err(|e| e.to_string())?;
        for TransactionJson(date, description, amount, category) in data.into_iter() {
            stmt.execute((&date, &description, &amount.amount, &category))
                .map_err(|e| e.to_string())?;
        }
        Ok(())
        // data.save()
    }
}
