use rusqlite::{Connection, Result as SqlResult};
use serde::Serialize;
use std::fs;
use tauri::{AppHandle, Manager};

struct Migration {
    version: i64,
    name: &'static str,
    sql: &'static str,
}

const MIGRATIONS: &[Migration] = &[
    Migration {
        version: 1,
        name: "initial_schema",
        sql: include_str!("../migrations/001_initial_schema.sql"),
    },
    Migration {
        version: 2,
        name: "reference_data",
        sql: include_str!("../migrations/002_reference_data.sql"),
    },
    Migration {
        version: 3,
        name: "music_genome_extension",
        sql: include_str!("../migrations/003_music_genome_extension.sql"),
    },
    Migration {
        version: 4,
        name: "reference_data_extension",
        sql: include_str!("../migrations/004_reference_data_extension.sql"),
    },
];

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

fn ensure_migration_table(connection: &Connection) -> SqlResult<()> {
    connection.execute_batch(
        "PRAGMA foreign_keys = ON;
         CREATE TABLE IF NOT EXISTS schema_migrations (
           version INTEGER PRIMARY KEY,
           name TEXT NOT NULL,
           applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
         );",
    )
}

fn has_migration(connection: &Connection, version: i64) -> SqlResult<bool> {
    let count: i64 = connection.query_row(
        "SELECT COUNT(*) FROM schema_migrations WHERE version = ?1",
        [version],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

fn apply_migrations(connection: &mut Connection) -> SqlResult<()> {
    ensure_migration_table(connection)?;

    for migration in MIGRATIONS {
        if has_migration(connection, migration.version)? {
            continue;
        }

        let transaction = connection.transaction()?;
        transaction.execute_batch(migration.sql)?;
        transaction.execute(
            "INSERT INTO schema_migrations(version, name) VALUES (?1, ?2)",
            (migration.version, migration.name),
        )?;
        transaction.commit()?;
    }

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
        ready: schema_version == MIGRATIONS.last().map(|m| m.version).unwrap_or(0)
            && table_count > 0,
    })
}
