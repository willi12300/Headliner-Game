# HEADLINER TECHNICAL DESIGN DOCUMENT V1

**Project:** Headliner  
**Version:** 1.0  
**Status:** Active development baseline  
**Target path:** `docs/HEADLINER_TECHNICAL_DESIGN_DOCUMENT_V1.md`

## 1. Purpose

This document defines how Headliner is structured, how simulation state is created and changed, how systems communicate, and how developers inspect and validate the world.

The Design Bible defines what Headliner should feel like. The Data Dictionary defines what data exists. This document defines how the software works.

## 2. Technical Vision

Headliner is a deterministic, data-driven simulation of a living music industry. The player manages a festival organisation inside a world where people, bands, labels, agencies, festivals, venues, sponsors, audiences and regional scenes continue to change independently.

```text
Player-Facing UI
        ↓
Application Services
        ↓
Simulation Engine
        ↓
Domain Systems
        ↓
Persistence Layer
        ↓
SQLite Database
```

Developer Mode sits alongside the player-facing UI and uses the same application services and simulation state.

The database is the durable source of truth. The simulation engine owns rules and state transitions. The UI displays, explains and requests changes to state; it does not invent simulation values.

## 3. Core Engineering Principles

### 3.1 Simulation first

Gameplay changes state through domain actions such as offering a contract, scheduling a festival, hiring staff or advancing time. UI components must never directly perform arbitrary mutations such as `festival.reputation += 10`.

### 3.2 Every important number is explainable

A derived value exposes:

- final value;
- source inputs;
- contributions and weights;
- modifiers;
- clamps and penalties;
- calculation time and version.

### 3.3 Derived values are not independently randomised

Incorrect:

```text
quality = random
popularity = random
followers = random
booking fee = random
```

Correct:

```text
people + catalogue + chemistry
        ↓
band fundamentals
        ↓
career outcomes and exposure
        ↓
reputation, momentum and popularity
        ↓
followers, draw and booking fee
```

### 3.4 Determinism

The same save state, simulation version, seed and player actions must produce the same outcome.

### 3.5 No system without inspection

Every simulation system must include domain logic, Developer Mode inspection, validation, event logging and relevant balance reporting.

### 3.6 Preserve history

Important state changes create events and history records. Historical facts are not erased when present state changes.

## 4. Technology and Responsibilities

### Stack

- Tauri
- React
- TypeScript
- Rust
- SQLite

### React and TypeScript

Responsible for application screens, Developer Mode, view models, filters, sorting, user interaction, explanations and reports.

### Rust

Responsible for database connection management, migrations, transactional persistence, large generation jobs, performance-critical simulation and central deterministic random-number execution where appropriate.

### SQLite

Responsible for durable save state, entities, relationships, events, history, contracts, financial transactions, indexes and migration versioning.

## 5. Target Project Structure

```text
src/
├── app/
│   ├── routing/
│   ├── state/
│   └── commands/
├── components/
│   ├── common/
│   ├── tables/
│   └── inspectors/
├── pages/
│   ├── game/
│   └── developer/
├── core/
│   ├── domain/
│   ├── generation/
│   ├── simulation/
│   ├── derived/
│   ├── validation/
│   ├── events/
│   ├── relationships/
│   ├── finance/
│   ├── contracts/
│   ├── scouting/
│   └── random/
├── services/
│   ├── database/
│   ├── simulation/
│   └── reporting/
├── types/
└── utils/

src-tauri/
├── migrations/
└── src/
    ├── commands/
    ├── database/
    ├── generation/
    └── simulation/
```

Rules:

- `core/domain` owns domain contracts and terminology.
- `core/generation` creates initial facts and history.
- `core/simulation` advances the world.
- `core/derived` calculates values from facts.
- `core/validation` detects invalid or implausible state.
- `services` coordinate use cases but do not own domain formulas.
- UI files contain no simulation formulas.
- SQL belongs in migrations or dedicated query modules.

## 6. Domain Model Rules

### Stable identifiers

Durable entities use stable UUIDs stored as text. Renaming, transfer or archival must not change an identifier.

### Explicit status values

Examples:

```text
Person: active, inactive, retired, deceased
Band: forming, active, on_hiatus, splitting, split, retired
Festival: planned, active, cancelled, dormant, defunct
```

### Archival over deletion

Entities referenced by events, relationships, contracts, history or statistics are archived rather than deleted.

### Facts and derived values

Stored facts include birth dates, skills, contract terms, attendance, release reviews, capacity, memories and ledger transactions.

Derived values include overall quality, popularity, momentum, festival draw, booking fee, sponsor attractiveness and current morale. Derived values may be cached, but must remain reproducible from their sources.

## 7. Entity Lifecycle

```text
Create
  ↓
Initialise facts
  ↓
Calculate derived values
  ↓
Validate
  ↓
Persist
  ↓
Simulate
  ↓
Create events and history
  ↓
Recalculate affected values
  ↓
Archive
```

Critical validation errors prevent persistence. Warnings may be stored for developer review.

## 8. Save Architecture

Each save stores metadata, current date, simulation version, generator version, preset, seed and RNG state, configuration, entities, events, history and validation results.

Minimum save metadata:

```text
id
name
created_at
updated_at
current_date
start_date
schema_version
simulation_version
generator_version
seed
rng_state
world_size
market
settings_json
```

Every save-owned table includes `save_id`. Queries must never mix saves.

Transactions are mandatory for world generation, simulation batches, contract completion, festival settlement, migrations and destructive developer actions.

## 9. Migration Architecture

Migrations are ordered, immutable SQL files.

```text
001_core_save_system.sql
002_people_and_members.sql
003_music_industry.sql
004_festival_industry.sql
005_relationships_events_history.sql
006_reference_data.sql
```

Rules:

- Never edit an applied released migration.
- Add a new migration instead.
- Apply transactionally.
- Record versions in `schema_migrations`.
- Add indexes with the query pattern that needs them.
- Validate foreign keys after migration.

Startup:

```text
Open database
↓
Enable foreign keys
↓
Read schema_migrations
↓
Apply missing migrations
↓
Record versions
↓
Run integrity checks
↓
Open application
```

## 10. World Generator v2

World generation is a deterministic staged pipeline.

### Presets

| Preset | People | Bands | Festivals | Labels | Agencies | Agents | Venues | Sponsors |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Tiny | 100 | 20 | 4 | 4 | 3 | 10 | 10 | 5 |
| Small | 500 | 100 | 15 | 20 | 15 | 50 | 40 | 20 |
| Medium | 2,000 | 400 | 50 | 60 | 40 | 200 | 150 | 60 |
| Large | 8,000 | 1,500 | 150 | 150 | 100 | 800 | 400 | 150 |
| Huge | 25,000 | 5,000 | 400 | 300 | 250 | 2,500 | 1,000 | 300 |

Presets also control geography, genre diversity, historical depth, relationship density, contract density, news volume, scene complexity and legacy-act frequency.

### Configuration contract

```ts
export interface WorldGenerationConfig {
  preset: "tiny" | "small" | "medium" | "large" | "huge";
  seed: number;
  startYear: number;
  market: string;
  counts: {
    people: number;
    bands: number;
    festivals: number;
    festivalCompanies: number;
    labels: number;
    agencies: number;
    agents: number;
    venues: number;
    sponsors: number;
    scouts: number;
  };
  options: {
    generateHistory: boolean;
    generateRelationships: boolean;
    generateContracts: boolean;
    generateNews: boolean;
    simulateYearsBeforeStart: number;
    stressTestMode: boolean;
  };
}
```

### Pipeline

```text
Create Save
↓
Generate Reference Data
↓
Generate Geography
↓
Generate Genres and Regional Scenes
↓
Generate Venues
↓
Generate Industry Organisations
↓
Generate People
↓
Form Bands
↓
Generate Careers and Releases
↓
Generate Festivals and Editions
↓
Generate Contracts
↓
Generate Relationships and Memories
↓
Generate History and News
↓
Calculate Derived Values
↓
Validate
↓
Commit
```

Every stage reports elapsed time, entities created and warnings.

```ts
export interface GenerationStageResult {
  stage: string;
  startedAt: number;
  finishedAt: number;
  entitiesCreated: Record<string, number>;
  warnings: GenerationWarning[];
}
```

Progress events contain stage identity, stage and overall progress, status and message.

The final report includes seed, preset, year, market, total time, entity counts, relationship and history counts, validation results, per-stage timings and generator version.

## 11. Random Number Generation

All simulation randomness uses an approved seeded RNG service. `Math.random()` is forbidden in generation and simulation code.

Use named streams:

```text
world
people
bands
history
relationships
festivals
finance
events
```

The save persists RNG state. Randomness creates uncertainty within plausible bounds and never overrides hard constraints.

## 12. Derived Values

All calculations use a shared result shape:

```ts
export interface DerivedComponent {
  key: string;
  label: string;
  sourceValue: number;
  weight?: number;
  contribution: number;
  explanation?: string;
}

export interface DerivedValueResult {
  key: string;
  value: number;
  unclampedValue: number;
  minimum: number;
  maximum: number;
  calculatedAt: string;
  components: DerivedComponent[];
  modifiers: DerivedComponent[];
  warnings: string[];
}
```

Rules:

- calculations are pure where practical;
- inputs are explicit;
- results are deterministic;
- ranges are enforced centrally;
- rounding happens only at display or persistence boundaries;
- generation, simulation, validation and Developer Mode use the same functions.

Dependency model:

```text
People
↓
Band Fundamentals
↓
Career Evidence
↓
Market State
↓
Followers, Festival Draw and Booking Fee
```

Dirty flags should trigger only affected recalculations.

## 13. Simulation Time

The canonical base tick is one day. Higher-level advances execute deterministic batches.

Daily order:

```text
Begin day
↓
Apply scheduled actions
↓
Update people
↓
Update bands
↓
Update labels and agencies
↓
Update venues
↓
Update festivals
↓
Update contracts and negotiations
↓
Update economy
↓
Resolve events
↓
Create history
↓
Recalculate dirty values
↓
Validate affected entities
↓
Persist transaction
↓
Advance date
```

System order is explicit and versioned.

## 14. Event System

Event categories include career, release, live performance, festival, contract, relationship, health, finance, media, controversy, award, organisational and world events.

```ts
export interface SimulationEvent {
  id: string;
  saveId: string;
  eventType: string;
  occurredAt: string;
  createdAt: string;
  primaryEntityType?: string;
  primaryEntityId?: string;
  severity: number;
  visibility: "hidden" | "internal" | "public";
  payload: Record<string, unknown>;
  causationEventId?: string;
  correlationId?: string;
}
```

Events may change facts, create memories, trigger recalculation, create news, produce inbox items or schedule future events. Handlers must be idempotent.

## 15. Relationships

Relationships are directional. Festival-to-band and band-to-festival may differ.

Initial dimensions:

```text
trust
respect
familiarity
affinity
tension
loyalty
resentment
professional confidence
```

Current relationship values derive from baseline compatibility, memories, unresolved conflict, shared success, decay, personality and organisational context.

Memories identify source events, involved entities, type, emotional valence, strength, decay, permanence and visibility.

## 16. Finance

Every financial change creates a ledger transaction. Balances must not be changed without one.

Transaction fields:

```text
id
save_id
entity_type
entity_id
date
category
description
amount
currency
related_entity_type
related_entity_id
event_id
```

Cash, profitability, burn, affordability and bankruptcy risk derive from the ledger and obligations.

## 17. Contracts and Negotiations

Contract lifecycle:

```text
draft
offered
countered
accepted
active
fulfilled
breached
cancelled
expired
```

Executed terms are immutable except through amendments. Payments create ledger entries; breaches create events and memories.

## 18. Developer Mode

Core sections:

```text
Dashboard
World Generation
World Database
Bands
People
Festivals
Festival Companies
Labels
Agencies
Agents
Sponsors
Venues
Staff
Scouts
Genres
Regions
Relationships
Events
History
News
Contracts
Finances
Validation
Balance Reports
Simulation Console
Settings
```

Entity browsers support search, filters, sorting, pagination or virtualisation, related-entity navigation, copy ID, hidden-value display, raw data and validation warnings.

Standard inspector tabs:

```text
Summary
Attributes
Derived Values
Relationships
History
Events
Finances
Raw Data
Developer
```

Derived-value explanations show source values, weights, contributions, modifiers, clamps, warnings and calculation time.

Developer edits change source facts through domain actions, recalculate values and create audit events. Derived values cannot be directly edited.

## 19. Validation

Severity levels:

- **Critical:** world cannot safely continue.
- **Error:** entity is invalid.
- **Warning:** valid but suspicious or implausible.

```ts
export interface ValidationIssue {
  id: string;
  saveId: string;
  severity: "critical" | "error" | "warning";
  ruleId: string;
  entityType?: string;
  entityId?: string;
  message: string;
  details?: Record<string, unknown>;
  detectedAt: string;
}
```

Validation runs after generation, migrations, major batches, developer edits and on demand. Every issue links to its entity inspector.

Examples include broken foreign keys, active bands with no members, growth ceiling below quality, festivals without owners, unsupported popularity, fee inflation and excessive genre dominance.

## 20. Reporting

Initial reports:

- entity counts;
- band status;
- genre and region distribution;
- popularity and fee distribution;
- festival profitability and failure;
- agent roster size;
- label roster composition;
- relationship density;
- band formation and split rate;
- career mobility;
- validation trends;
- system performance.

Reports support comparison by seed, preset, year, simulation version and generator version.

## 21. Performance Budgets

| Operation | Tiny | Medium | Huge |
|---|---:|---:|---:|
| Generate world | <1 s | <5 s | <20 s |
| Advance one day | <10 ms | <50 ms | <250 ms |
| Advance one year | <1 s | <10 s | <60 s |
| Open entity profile | <100 ms | <100 ms | <150 ms |
| Search bands | <100 ms | <150 ms | <250 ms |
| Full validation | <250 ms | <2 s | <10 s |

Measure stage and system timings. Use indexes, virtualised tables, transaction batching, dirty recalculation and set-based reporting. Move expensive work to Rust only after profiling.

## 22. Responsiveness and Cancellation

Medium and larger generation, long simulations, full validation and large reports run outside the UI thread and emit progress. Cancellation must leave the database at a valid transaction boundary.

## 23. Errors, Logging and Diagnostics

Domain errors are structured and actionable. Infrastructure errors preserve diagnostics. Silent partial failure is prohibited.

Logs include save ID, simulation date, system, action, correlation ID, elapsed time, entity IDs and errors.

## 24. Versioning

Track separately:

- application version;
- schema version;
- simulation version;
- generator version;
- derived-values specification version.

Formula changes, update-order changes and probability changes increment simulation version. Initial-world changes increment generator version.

## 25. Testing Strategy

Required coverage:

- unit tests for calculations, relationships, finance, contracts and validation;
- deterministic fixed-seed tests;
- compact world-summary snapshots;
- property tests for ranges and invariants;
- migration, generation, save/load and one-year integration tests;
- Large and Huge stress tests.

Core invariant:

```text
same state + same seed + same actions = same result
```

## 26. Coding Standards

- One responsibility per system.
- No formulas in UI components.
- No direct database access from presentation components.
- No `Math.random()` in generation or simulation.
- No direct editing of derived values.
- Important changes create events.
- Every major system includes validation and inspection.
- Use explicit domain types.
- Prefer pure calculation functions.
- Use transactions for multi-record changes.
- Avoid hidden global mutable state.
- Use terminology from the Data Dictionary.

## 27. Milestones

### Milestone 4 — World Generator v2

Deliverables:

- generation panel;
- Tiny through Huge presets;
- deterministic seeds;
- staged pipeline;
- progress events;
- generation report;
- post-generation validation.

Definition of done:

- same seed and config produce the same summary;
- all presets are selectable;
- Tiny and Small have no critical validation issues;
- Medium remains inspectable and responsive;
- report counts match stored data.

### Milestone 5 — Structured Industry Generation

Band archetypes, label and agency identities, festival hierarchy, regional scenes, sponsors, venues and coherent contracts.

### Milestone 6 — Generated Career History

Releases, performances, reviews, awards, controversies, previous editions and market values caused by historical evidence.

### Milestone 7 — Simulation Year 1

Daily tick, scheduled actions, development, relationships, contracts, festival operation, economic settlement, events and checkpoint saves.

## 28. Definition of Done for New Systems

A system is complete only when relevant items are done:

- design documented;
- data model defined;
- migration added;
- generator support added;
- simulation implemented;
- values explained;
- events recorded;
- validation added;
- inspector added;
- reporting added;
- deterministic tests pass;
- performance measured;
- save/load tested.

## 29. Initial Technical Decisions

### TDR-001 — SQLite

Use SQLite for local durable saves because it is transactional, portable and appropriate for relational simulation data.

### TDR-002 — Seeded deterministic simulation

All randomness uses persisted seeded streams for reproducibility and debugging.

### TDR-003 — Shared derived calculations

Generation, simulation, validation and Developer Mode use the same calculation functions.

### TDR-004 — Permanent Developer Mode

Inspection and validation are built alongside gameplay because Headliner requires causal debugging and long-term balancing.

### TDR-005 — Causal event history

Meaningful transitions create events with causation links where possible.

## 30. Golden Rules

1. The database stores durable truth.
2. The simulation owns state transitions.
3. The UI displays state and requests actions.
4. Derived values come from facts.
5. Randomness creates uncertainty, not nonsense.
6. Important outcomes preserve their causes.
7. Every system can be inspected.
8. Every system can be validated.
9. Same seed and actions produce the same result.
10. No feature is complete until it works at realistic scale.

## 31. Immediate Implementation Order

```text
1. WorldGenerationConfig
2. World-size preset definitions
3. Generation pipeline interface
4. Progress event interface
5. Generation report interface
6. World Generation UI
7. Tiny preset integration
8. Small preset integration
9. Determinism tests
10. Medium-world performance pass
```

Large and Huge optimisation begins only after Tiny, Small and Medium are coherent and validation is reliable.
