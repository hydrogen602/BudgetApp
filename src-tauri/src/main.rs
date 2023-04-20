// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use budgeting::db::DBState;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    use budgeting::api::*;

    tauri::Builder::default()
        .manage(DBState::default())
        // .manage(MyState::default())
        .invoke_handler(tauri::generate_handler![
            save_to_disk,
            load_from_disk,
            db_api::save_new_transactions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
