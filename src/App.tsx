import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import type { Snapshot, WorldState } from "./core/domain/models";
import { generateWorld } from "./core/generation/generateWorld";
import { simulateToYear, snapshotNow } from "./core/simulation/simulate";

interface DatabaseStatus {
  path: string;
  schemaVersion: number;
  tableCount: number;
  ready: boolean;
}

const formatNumber = (value: number): string => Math.round(value).toLocaleString();
const formatDecimal = (value: number): string => value.toFixed(1);

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SnapshotCard({ snapshot, selected, onSelect }: { snapshot: Snapshot; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`snapshot-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      <span>YEAR</span>
      <strong>{snapshot.year}</strong>
      <small>{snapshot.activeBands} active bands · {snapshot.activeFestivals} festivals</small>
    </button>
  );
}

function App() {
  const [seed, setSeed] = useState(48291735);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedYear, setSelectedYear] = useState(0);
  const [database, setDatabase] = useState<DatabaseStatus | null>(null);
  const [status, setStatus] = useState("Ready to initialise Headliner Core.");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    invoke<DatabaseStatus>("get_database_status")
      .then(setDatabase)
      .catch(() => setDatabase(null));
  }, []);

  const snapshots = useMemo(() => {
    if (!world) return [];
    const initial = snapshotNow({ ...world, year: 0 });
    initial.year = 0;
    return [initial, ...world.snapshots];
  }, [world]);

  const activeSnapshot = snapshots.find((snapshot) => snapshot.year === selectedYear) ?? snapshots[snapshots.length - 1];

  async function initialiseDatabase() {
    setStatus("Applying SQLite migrations and reference data...");
    try {
      const result = await invoke<DatabaseStatus>("initialize_database");
      setDatabase(result);
      setStatus(`SQLite ready: ${result.tableCount} tables, schema v${result.schemaVersion}.`);
    } catch (error) {
      setStatus(`Database initialisation failed: ${String(error)}`);
    }
  }

  function createWorld() {
    const cleanSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 48291735;
    const generated = generateWorld(cleanSeed);
    setWorld(generated);
    setSelectedYear(0);
    setStatus(`Generated deterministic test world from seed ${cleanSeed}.`);
  }

  async function runToYear(targetYear: number) {
    setRunning(true);
    setStatus(`Simulating industry history to Year ${targetYear}...`);
    await new Promise((resolve) => window.setTimeout(resolve, 30));
    const base = world ? structuredClone(world) : generateWorld(Math.abs(Math.floor(seed)));
    const simulated = simulateToYear(base, targetYear);
    setWorld(simulated);
    setSelectedYear(targetYear);
    setStatus(`Simulation complete: ${targetYear} years / ${targetYear * 52} weekly cycles.`);
    setRunning(false);
  }

  function resetLab() {
    setWorld(null);
    setSelectedYear(0);
    setStatus("Simulation Lab reset. Database files were not deleted.");
  }

  const recentEvents = world ? [...world.events].slice(-8).reverse() : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">HEADLINER<span>CORE · SIMULATION LAB</span></div>
        <nav>
          <button className="active">◫ Simulation Lab</button>
          <button disabled>◉ World Database</button>
          <button disabled>♫ Bands & Members</button>
          <button disabled>▥ Festivals</button>
          <button disabled>⌁ Relationships</button>
          <button disabled>↗ Balance Reports</button>
        </nav>
        <div className={`database-card ${database?.ready ? "ready" : ""}`}>
          <span>SQLITE FOUNDATION</span>
          <strong>{database?.ready ? "READY" : "NOT INITIALISED"}</strong>
          <small>{database?.ready ? `${database.tableCount} tables · schema v${database.schemaVersion}` : "Click initialise to create the local database."}</small>
          <button onClick={initialiseDatabase}>{database?.ready ? "Recheck Migrations" : "Initialise Database"}</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">HEADLINER CORE v0.0.2</span>
            <h1>Living Music Industry Laboratory</h1>
            <p>Generate a small world, run it for decades and inspect the history that emerges.</p>
          </div>
          <div className="header-status"><i></i>{status}</div>
        </header>

        <section className="control-panel panel">
          <div className="control-copy">
            <span className="eyebrow">DETERMINISTIC WORLD</span>
            <h2>Simulation Seed</h2>
            <p>The same seed and simulation version produce the same initial world and weekly outcomes.</p>
          </div>
          <label>
            Seed
            <input type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} />
          </label>
          <button className="primary" onClick={createWorld} disabled={running}>Generate Test World</button>
          <button className="secondary" onClick={resetLab} disabled={running}>Reset</button>
        </section>

        <section className="world-metrics">
          <Metric label="Bands" value={world ? String(world.bands.length) : "20"} />
          <Metric label="Band Members" value={world ? String(world.members.length) : "60–100"} />
          <Metric label="Labels / Agents" value={world ? `${world.labels.length} / ${world.agents.length}` : "4 / 10"} />
          <Metric label="Festivals" value={world ? String(world.festivals.length) : "4"} />
          <Metric label="Sponsors / Venues" value={world ? `${world.sponsors.length} / ${world.venues.length}` : "5 / 8"} />
          <Metric label="Current Week" value={world ? formatNumber(world.week) : "0"} tone={world && world.week > 0 ? "good" : "default"} />
        </section>

        <section className="simulation-actions panel">
          <div>
            <span className="eyebrow">FAST-FORWARD CHECKPOINTS</span>
            <h2>Run the world forward</h2>
          </div>
          {[5, 10, 15, 20].map((year) => (
            <button key={year} onClick={() => runToYear(year)} disabled={running}>
              <strong>{year}</strong><span>YEARS</span>
            </button>
          ))}
        </section>

        {world && activeSnapshot ? (
          <>
            <section className="snapshot-strip">
              {snapshots.map((snapshot) => (
                <SnapshotCard
                  key={snapshot.year}
                  snapshot={snapshot}
                  selected={snapshot.year === activeSnapshot.year}
                  onSelect={() => setSelectedYear(snapshot.year)}
                />
              ))}
            </section>

            <section className="dashboard-grid">
              <div className="panel overview-panel">
                <div className="panel-heading">
                  <div><span className="eyebrow">YEAR {activeSnapshot.year} SNAPSHOT</span><h2>Industry Health</h2></div>
                  <span className="seed-label">Seed {world.seed}</span>
                </div>
                <div className="metric-grid">
                  <Metric label="Active Bands" value={String(activeSnapshot.activeBands)} tone="good" />
                  <Metric label="Band Splits" value={String(activeSnapshot.splitBands)} tone={activeSnapshot.splitBands > 4 ? "warn" : "default"} />
                  <Metric label="Active Festivals" value={String(activeSnapshot.activeFestivals)} tone="good" />
                  <Metric label="Festival Closures" value={String(activeSnapshot.closedFestivals)} tone={activeSnapshot.closedFestivals > 0 ? "warn" : "default"} />
                  <Metric label="Average Band Popularity" value={formatDecimal(activeSnapshot.averageBandPopularity)} />
                  <Metric label="Average Festival Rep" value={formatDecimal(activeSnapshot.averageFestivalReputation)} />
                  <Metric label="Total Band Followers" value={formatNumber(activeSnapshot.totalFollowers)} />
                  <Metric label="Viral Moments" value={String(activeSnapshot.viralMoments)} />
                  <Metric label="Member Departures" value={String(activeSnapshot.memberDepartures)} />
                  <Metric label="Health Incidents" value={String(activeSnapshot.injuries)} />
                </div>
              </div>

              <div className="panel ranking-panel">
                <div className="panel-heading"><h2>Top Bands</h2><span>Popularity</span></div>
                {activeSnapshot.topBands.map((band, index) => (
                  <div className="ranking-row" key={band.name}>
                    <b>{index + 1}</b>
                    <div><strong>{band.name}</strong><small>{formatNumber(band.followers)} followers</small></div>
                    <span>{formatDecimal(band.popularity)}</span>
                  </div>
                ))}
              </div>

              <div className="panel ranking-panel">
                <div className="panel-heading"><h2>Top Festivals</h2><span>Reputation</span></div>
                {activeSnapshot.topFestivals.map((festival, index) => (
                  <div className="ranking-row" key={festival.name}>
                    <b>{index + 1}</b>
                    <div><strong>{festival.name}</strong><small>{formatNumber(festival.capacity)} capacity</small></div>
                    <span>{formatDecimal(festival.reputation)}</span>
                  </div>
                ))}
              </div>

              <div className="panel events-panel">
                <div className="panel-heading"><h2>Latest Emergent Events</h2><span>{world.events.length} total</span></div>
                {recentEvents.length ? recentEvents.map((event) => (
                  <div className="event-row" key={event.id}>
                    <span className={`severity severity-${Math.min(event.severity, 5)}`}>{event.year}</span>
                    <div><strong>{event.type.split("_").join(" ")}</strong><p>{event.summary}</p></div>
                  </div>
                )) : <p className="empty">Run the simulation to generate injuries, breakthroughs, disputes, departures, bookings and closures.</p>}
              </div>
            </section>
          </>
        ) : (
          <section className="empty-world panel">
            <div className="world-orbit">♫</div>
            <div><span className="eyebrow">FIRST MILESTONE</span><h2>Generate the first Headliner universe</h2><p>The laboratory begins with 20 bands, individual members, labels, agents, rival festivals, sponsors, venues and staff. After generation, run the same world to Year 5, 10, 15 and 20.</p></div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
