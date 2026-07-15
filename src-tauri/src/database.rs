use rusqlite::{Connection, Result as SqlResult};
use serde::Serialize;
use std::fs;
use tauri::{AppHandle, Manager};

const INITIAL_SCHEMA: &str = include_str!("../migrations/001_initial_schema.sql");
const REFERENCE_DATA: &str = include_str!("../migrations/002_reference_data.sql");

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseStatus {
    pub path: String,
    pub schema_version: i64,
    pub table_count: i64,
    pub ready: bool,
}

fn database_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Unable to resolve app data directory: {error}"))?;
    fs::create_dir_all(&directory)
        .map_err(|error| format!("Unable to create app data directory: {error}"))?;
    Ok(directory.join("headliner.sqlite3"))
}

fn apply_migrations(connection: &mut Connection) -> SqlResult<()> {
    connection.execute_batch(INITIAL_SCHEMA)?;
    connection.execute_batch(REFERENCE_DATA)?;
    connection.execute(
        "INSERT OR IGNORE INTO schema_migrations(version, name) VALUES (?1, ?2)",
        (1_i64, "initial_schema_and_reference_data"),
    )?;
    Ok(())
}

#[tauri::command]
pub fn initialize_database(app: AppHandle) -> Result<DatabaseStatus, String> {
    let path = database_path(&app)?;
    let mut connection = Connection::open(&path)
        .map_err(|error| format!("Unable to open SQLite database: {error}"))?;
    apply_migrations(&mut connection)
        .map_err(|error| format!("Unable to apply database migrations: {error}"))?;
    read_status(&connection, path.to_string_lossy().to_string())
        .map_err(|error| format!("Unable to inspect database: {error}"))
}

#[tauri::command]
pub fn get_database_status(app: AppHandle) -> Result<DatabaseStatus, String> {
    let path = database_path(&app)?;
    if !path.exists() {
        return Ok(DatabaseStatus {
            path: path.to_string_lossy().to_string(),
            schema_version: 0,
            table_count: 0,
            ready: false,
        });
    }

    let connection = Connection::open(&path)
        .map_err(|error| format!("Unable to open SQLite database: {error}"))?;
    read_status(&connection, path.to_string_lossy().to_string())
        .map_err(|error| format!("Unable to inspect database: {error}"))
}

fn read_status(connection: &Connection, path: String) -> SqlResult<DatabaseStatus> {
    let schema_version = connection
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0);
    let table_count = connection.query_row(
        "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
        [],
        |row| row.get::<_, i64>(0),
    )?;

    Ok(DatabaseStatus {
        path,
        schema_version,
        table_count,
        ready: schema_version >= 1 && table_count > 0,
    })
}
