mod database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            database::initialize_database,
            database::get_database_status,
            database::write_world_save,
            database::read_world_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
