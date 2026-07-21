# Headliner Database Milestone 1

This drop-in pack extends the existing working Simulation Lab database.

## Files to add

- `src-tauri/migrations/003_music_genome_extension.sql`
- `src-tauri/migrations/004_reference_data_extension.sql`
- `src/core/domain/database.ts`
- `src/core/domain/save.ts`
- `src/core/domain/music.ts`
- `src/core/domain/festival.ts`
- `src/core/domain/relationships.ts`
- `src/core/domain/index.ts`

## File to replace

- `src-tauri/src/database.rs`

The new migration runner applies migrations one at a time, records each version and wraps every migration in a SQLite transaction.

## Important existing database note

If the old Headliner database already exists, migrations 3 and 4 will be applied automatically when you click **Initialise Database**.

The database file is stored in the Tauri application-data directory, not inside the repository.

## Expected result

After rebuilding and initialising the database:

- schema version should be `4`
- table count should increase substantially
- existing Simulation Lab data remains compatible

## Run

```powershell
npm run tauri dev
```

Then click **Initialise Database** in the Simulation Lab.

## Commit message

```text
Add database milestone 1 migrations and domain types
```
