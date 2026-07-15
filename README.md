# Headliner Core v0.0.2

A desktop-first festival and living music-industry simulation built with Tauri, React and TypeScript.

## Current milestone

This build contains:

- Headliner simulation principles
- Data Dictionary v1
- Simulation Rules v1
- SQLite schema with core entity, relationship, event and snapshot tables
- Reference genres, roles and traits
- Native SQLite initialisation through Tauri/Rust
- Seeded procedural test-world generator
- Individual bands and members
- Labels, agents, festivals, sponsors, venues and staff
- Weekly progression, health incidents, conflicts, departures, viral moments, rival bookings and financial closures
- Simulation checkpoints at Year 0, 5, 10, 15 and 20
- A desktop Simulation Lab interface

## Run

```powershell
npm install
npm run tauri dev
```

Inside the app:

1. Click **Initialise Database**.
2. Choose or retain a seed.
3. Click **Generate Test World**.
4. Run the simulation to Year 5, 10, 15 or 20.
5. Compare snapshots and inspect emergent events.

## Project documents

- `docs/HEADLINER_PRINCIPLES.md`
- `docs/DATA_DICTIONARY_V1.md`
- `docs/SIMULATION_RULES_V1.md`

## Next milestone

Headliner Core v0.0.3 will persist generated worlds into SQLite, add automated multi-seed balance runs, CSV/JSON report exports, player-festival creation and hidden scouting knowledge.


## Design documentation

- `docs/HEADLINER_DESIGN_BIBLE_V1.md` — constitutional design vision and system rules.
- `docs/HEADLINER_PRINCIPLES.md` — concise simulation principles.
- `docs/SIMULATION_RULES_V1.md` — current simulation implementation notes.
- `docs/DATA_DICTIONARY_V1.md` — early data definitions; scheduled for full replacement in the next milestone.
- `docs/DEVELOPMENT_DIARY.md` — milestone history and decisions.
