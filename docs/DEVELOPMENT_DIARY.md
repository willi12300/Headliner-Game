# Headliner Development Diary

## 2026-10-12 — Persistent world and weekly news

- Added versioned manual and autosave slots preserving the entire simulation and RNG state.
- Added SQLite save migration and native save/load commands, with browser preview storage.
- Added weekly advancement, recorded industry news, unread tracking and active dispute history.
- Added continuity/corruption tests and SQLite persistence checks.
- Added a narrow-screen layout for the new controls and news page.
- Native Windows and Android builds still require toolchain/device verification.

## 2026-07-14 — Project foundation

### Built

- Created the permanent Tauri + React + TypeScript desktop repository.
- Installed and validated the Windows, Rust and Tauri development toolchain.
- Built the Headliner Simulation Lab desktop screen.
- Added an initial SQLite schema and reference data.
- Added deterministic world generation and long-range simulation checkpoints.

### Decision

The project will be developed as a simulation-first desktop game. Player-facing pages will display a persistent, living industry rather than disconnected placeholder systems.

### Lesson

A permanent repository, deterministic simulation and formal design documentation are required before expanding into dozens of gameplay pages.

## 2026-07-14 — Design Bible v1

### Built

- Added `HEADLINER_DESIGN_BIBLE_V1.md` as the constitutional design document for the project.

### Locked principles

- Living world.
- Emergent, explainable stories.
- Hidden truth and imperfect scouting.
- Relationship memories.
- Meaningful customisation.
- Long-term history.
- Fair AI operating under the same constraints.

### Next

Create the formal Data Dictionary v1 from the Bible, defining exact fields, types, ranges, visibility and derivation rules for every entity.
