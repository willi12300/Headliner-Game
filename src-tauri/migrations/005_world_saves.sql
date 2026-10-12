CREATE TABLE IF NOT EXISTS world_saves (
    slot TEXT PRIMARY KEY CHECK(slot IN ('manual', 'autosave')),
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
