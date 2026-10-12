import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { FestivalDesk } from "./FestivalDesk";
import { pendingFestivalDecisions } from "./core/simulation/playerFestival";
import { NewsFeed } from "./NewsFeed";
import { loadWorld, saveWorld, type SaveSlot } from "./core/persistence/storage";
import type { Band, WorldState } from "./core/domain/models";
import type { DerivedValue } from "./core/simulation/derived";
import { generateWorld } from "./core/generation/generateWorld";
import { simulateWeek, snapshotNow } from "./core/simulation/simulate";
import { validateWorld, type ValidationIssue } from "./core/simulation/validateWorld";

interface DatabaseStatus { path: string; schemaVersion: number; tableCount: number; ready: boolean; }
type Page = "festival" | "news" | "lab" | "world" | "bands" | "people" | "festivals" | "relationships" | "reports";
type DetailTab = "overview" | "attributes" | "relationships" | "history" | "raw";

const n = (value: number) => Math.round(value).toLocaleString();
const d = (value: number) => value.toFixed(1);
const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" }) {
  return <div className={`metric metric-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}
function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const percent = Math.max(0, Math.min(100, value / max * 100));
  return <div className="attribute-bar"><div><span>{label}</span><b>{d(value)}</b></div><i><em style={{ width: `${percent}%` }} /></i></div>;
}

function DerivedBar({ label, metric, format = "score" }: { label: string; metric: DerivedValue; format?: "score" | "number" | "money" }) {
  const shown = format === "money" ? money(metric.value) : format === "number" ? n(metric.value) : d(metric.value);
  const percent = format === "score" ? Math.max(0, Math.min(100, metric.value)) : 100;
  return <details className="derived-metric"><summary><div className="attribute-bar"><div><span>{label}</span><b>{shown}</b></div>{format === "score" && <i><em style={{ width: `${percent}%` }} /></i>}<small>Why this value?</small></div></summary><div className="derived-breakdown"><p>{metric.formula}</p>{metric.components.map((component)=><div key={`${label}-${component.label}`}><span>{component.label}<small>Source {d(component.sourceValue)} · weight {component.weight}</small></span><b>{format === "money" ? money(component.contribution) : component.contribution >= 1000 ? n(component.contribution) : d(component.contribution)}</b></div>)}</div></details>;
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return <section className="empty-world panel"><div className="world-orbit">♫</div><div><span className="eyebrow">WORLD REQUIRED</span><h2>Start your music world</h2><p>Create the bands, musicians and rivals around your first festival. Then choose a site, book a lineup and advance the weeks.</p><button className="primary" onClick={onGenerate}>Create World</button></div></section>;
}

function BandInspector({ world, initialId }: { world: WorldState; initialId?: string }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [selectedId, setSelectedId] = useState(initialId ?? world.bands[0]?.id ?? "");
  const [tab, setTab] = useState<DetailTab>("overview");
  const bands = useMemo(() => world.bands.filter((band) => (genre === "all" || band.genre === genre) && `${band.name} ${band.homeCity}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => b.popularity-a.popularity), [world, query, genre]);
  const selected = world.bands.find((band) => band.id === selectedId) ?? bands[0];
  const genres = [...new Set(world.bands.map((band) => band.genre))].sort();
  return <BrowserLayout title="Bands & Members" subtitle={`${bands.length} of ${world.bands.length} bands`} controls={<><input aria-label="Search bands" placeholder="Search band or city…" value={query} onChange={e=>setQuery(e.target.value)} /><select value={genre} onChange={e=>setGenre(e.target.value)}><option value="all">All genres</option>{genres.map(g=><option key={g}>{g}</option>)}</select></>} list={<table><thead><tr><th>Band</th><th>Genre</th><th>Pop.</th><th>Momentum</th><th>Followers</th></tr></thead><tbody>{bands.map(band=><tr key={band.id} className={selected?.id===band.id?"selected":""} onClick={()=>setSelectedId(band.id)}><td><strong>{band.name}</strong><small>{band.homeCity} · {band.status}</small></td><td>{band.genre}</td><td>{d(band.popularity)}</td><td>{d(band.momentum)}</td><td>{n(band.followers)}</td></tr>)}</tbody></table>} detail={selected ? <BandDetail band={selected} world={world} tab={tab} setTab={setTab} /> : <p className="empty">No matching bands.</p>} />;
}

function BandDetail({ band, world, tab, setTab }: { band: Band; world: WorldState; tab: DetailTab; setTab: (tab: DetailTab)=>void }) {
  const members = world.members.filter(member=>band.memberIds.includes(member.id));
  const label = world.labels.find(label=>label.id===band.labelId);
  const agent = world.agents.find(agent=>agent.id===band.agentId);
  const events = world.events.filter(event=>event.entityIds.includes(band.id)).slice(-12).reverse();
  return <><div className="entity-header"><div><span className="eyebrow">{band.genre} · {band.homeCity}</span><h2>{band.name}</h2><p>{band.traits.join(" · ")}</p></div><span className={`status status-${band.status}`}>{band.status}</span></div><Tabs tab={tab} setTab={setTab} />
  {tab==="overview"&&<><div className="detail-metrics"><Metric label="Popularity" value={d(band.popularity)} /><Metric label="Momentum" value={d(band.momentum)} tone={band.momentum>65?"good":"default"}/><Metric label="Followers" value={n(band.followers)} /><Metric label="Festival Draw" value={n(band.ticketDraw)} /><Metric label="Booking Fee" value={money(band.bookingFee)} /></div><dl className="facts"><div><dt>Label</dt><dd>{label?.name ?? "None"}</dd></div><div><dt>Agent</dt><dd>{agent?.name ?? "None"}</dd></div><div><dt>Members</dt><dd>{members.length}</dd></div><div><dt>Archetype</dt><dd>{band.isWonderband ? "Hidden wonderband" : "Established profile"}</dd></div></dl><h3>Members</h3><div className="member-grid">{members.map(member=><div className="member-card" key={member.id}><strong>{member.name}</strong><span>{member.role} · {member.age}</span><small>Ability {member.currentAbility} / Potential {member.potentialAbility}</small></div>)}</div></>}
  {tab==="attributes"&&<div className="attribute-grid derived-grid"><DerivedBar label="Overall quality" metric={band.derived.overallQuality}/><DerivedBar label="Growth ceiling" metric={band.derived.growthCeiling}/><DerivedBar label="Live performance" metric={band.derived.livePerformance}/><DerivedBar label="Catalogue quality" metric={band.derived.catalogueQuality}/><DerivedBar label="Chemistry" metric={band.derived.chemistry}/><DerivedBar label="Professionalism" metric={band.derived.professionalism}/><DerivedBar label="Reputation" metric={band.derived.reputation}/><DerivedBar label="Commercial appeal" metric={band.derived.commercialAppeal}/><DerivedBar label="Fan loyalty" metric={band.derived.fanLoyalty}/><DerivedBar label="Festival draw score" metric={band.derived.festivalDraw}/><DerivedBar label="Popularity" metric={band.derived.popularity}/><DerivedBar label="Momentum" metric={band.derived.momentum}/><DerivedBar label="Followers" metric={band.derived.followers} format="number"/><DerivedBar label="Booking fee" metric={band.derived.bookingFee} format="money"/></div>}
  {tab==="relationships"&&<div className="relationship-list">{members.flatMap(member=>Object.entries(member.relationships).map(([otherId,value])=>({member,other:world.members.find(m=>m.id===otherId),value}))).slice(0,20).map((r,index)=><div key={`${r.member.id}-${r.other?.id}-${index}`}><span>{r.member.name} → {r.other?.name ?? "Unknown"}</span><b>{r.value}</b></div>)}</div>}
  {tab==="history"&&<div>{events.length?events.map(event=><div className="event-row" key={event.id}><span className="severity">Y{event.year}</span><div><strong>{event.type.split("_").join(" ")}</strong><p>{event.summary}</p></div></div>):<p className="empty">No recorded events for this band yet.</p>}</div>}
  {tab==="raw"&&<pre>{JSON.stringify(band,null,2)}</pre>}</>;
}

function FestivalInspector({ world }: { world: WorldState }) {
  const [selectedId,setSelectedId]=useState(world.festivals[0]?.id??""); const [tab,setTab]=useState<DetailTab>("overview");
  const selected=world.festivals.find(f=>f.id===selectedId)??world.festivals[0];
  return <BrowserLayout title="Festivals" subtitle={`${world.festivals.length} active industry records`} controls={<span className="filter-note">Inspect identity, reputation, capacity and solvency</span>} list={<table><thead><tr><th>Festival</th><th>Focus</th><th>Capacity</th><th>Rep.</th><th>Cash</th></tr></thead><tbody>{world.festivals.map(f=><tr key={f.id} className={selected?.id===f.id?"selected":""} onClick={()=>setSelectedId(f.id)}><td><strong>{f.name}</strong><small>{f.type} · {f.status}</small></td><td>{f.genreFocus}</td><td>{n(f.capacity)}</td><td>{f.reputation}</td><td>{money(f.cashReserves-f.debt)}</td></tr>)}</tbody></table>} detail={selected&&<><div className="entity-header"><div><span className="eyebrow">{selected.type} · {selected.genreFocus}</span><h2>{selected.name}</h2><p>{n(selected.attendance)} attendance from {n(selected.capacity)} capacity</p></div><span className={`status status-${selected.status}`}>{selected.status}</span></div><Tabs tab={tab} setTab={setTab}/>{tab==="overview"&&<><div className="detail-metrics"><Metric label="Reputation" value={d(selected.reputation)}/><Metric label="Attendance" value={`${Math.round(selected.attendance/selected.capacity*100)}%`} tone="good"/><Metric label="Net cash" value={money(selected.cashReserves-selected.debt)}/><Metric label="Followers" value={n(selected.followers)}/></div><dl className="facts"><div><dt>Discovery reputation</dt><dd>{selected.discoveryReputation}</dd></div><div><dt>Authenticity</dt><dd>{selected.authenticity}</dd></div><div><dt>Commercialism</dt><dd>{selected.commercialism}</dd></div><div><dt>Safety reputation</dt><dd>{selected.safetyReputation}</dd></div></dl></>}{tab==="attributes"&&<div className="attribute-grid"><Bar label="Reputation" value={selected.reputation}/><Bar label="Discovery" value={selected.discoveryReputation}/><Bar label="Authenticity" value={selected.authenticity}/><Bar label="Commercialism" value={selected.commercialism}/><Bar label="Safety" value={selected.safetyReputation}/><Bar label="Production quality" value={selected.productionQuality} max={20}/><Bar label="Risk tolerance" value={selected.riskTolerance} max={20}/><Bar label="Expansion ambition" value={selected.expansionAmbition} max={20}/></div>}{tab==="history"&&<p className="empty">Edition history will populate as festival-year simulation is expanded.</p>}{tab==="relationships"&&<p className="empty">No explicit festival relationship records exist in the current world model.</p>}{tab==="raw"&&<pre>{JSON.stringify(selected,null,2)}</pre>}</>} />;
}

function BrowserLayout({title,subtitle,controls,list,detail}:{title:string;subtitle:string;controls:React.ReactNode;list:React.ReactNode;detail:React.ReactNode}) { return <section className="browser"><div className="browser-toolbar"><div><span className="eyebrow">WORLD BROWSER</span><h1>{title}</h1><p>{subtitle}</p></div><div className="browser-controls">{controls}</div></div><div className="browser-grid"><div className="entity-list panel">{list}</div><div className="entity-detail panel">{detail}</div></div></section>; }
function Tabs({tab,setTab}:{tab:DetailTab;setTab:(tab:DetailTab)=>void}) { return <div className="tabs">{(["overview","attributes","relationships","history","raw"] as DetailTab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>; }

function Reports({ world, onJump }: { world: WorldState; onJump:(issue:ValidationIssue)=>void }) {
  const issues=validateWorld(world); const errors=issues.filter(i=>i.severity==="error").length; const warnings=issues.filter(i=>i.severity==="warning").length;
  const genres=Object.entries(world.bands.reduce<Record<string,number>>((acc,b)=>({...acc,[b.genre]:(acc[b.genre]??0)+1}),{})).sort((a,b)=>b[1]-a[1]);
  return <section className="report-page"><div className="browser-toolbar"><div><span className="eyebrow">BALANCE & INTEGRITY</span><h1>Validation Reports</h1><p>Automated structural checks and high-level world distribution.</p></div></div><div className="report-metrics"><Metric label="Errors" value={String(errors)} tone={errors?"warn":"good"}/><Metric label="Warnings" value={String(warnings)} tone={warnings?"warn":"good"}/><Metric label="Checks" value={String(issues.length)}/><Metric label="Largest genre" value={genres[0]?.[0]??"—"}/></div><div className="report-grid"><div className="panel report-panel"><div className="panel-heading"><h2>Validation results</h2><span>{issues.length} results</span></div>{issues.map(issue=><button className={`issue issue-${issue.severity}`} key={issue.id} onClick={()=>onJump(issue)}><span>{issue.severity}</span><div><strong>{issue.entityName??issue.entityType}</strong><p>{issue.message}</p><small>{issue.rule}</small></div></button>)}</div><div className="panel report-panel"><div className="panel-heading"><h2>Genre distribution</h2><span>{world.bands.length} bands</span></div>{genres.map(([genre,count])=><div className="distribution" key={genre}><span>{genre}</span><i><em style={{width:`${count/world.bands.length*100}%`}}/></i><b>{count}</b></div>)}</div></div></section>;
}

function App() {
  const [seed,setSeed]=useState(48291735); const [world,setWorld]=useState<WorldState|null>(null); const [selectedYear,setSelectedYear]=useState(0); const [database,setDatabase]=useState<DatabaseStatus|null>(null); const [status,setStatus]=useState("Ready to initialise Headliner Core."); const [running,setRunning]=useState(false); const [page,setPage]=useState<Page>("festival"); const [jumpBandId,setJumpBandId]=useState<string|undefined>();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const operation = useRef(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty || running) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, running]);
  useEffect(()=>{invoke<DatabaseStatus>("get_database_status").then(setDatabase).catch(()=>setDatabase(null));},[]);
  const snapshots = useMemo(() => {
    if (!world) return [];
    return [...world.snapshots.filter(snapshot => snapshot.year !== world.year), snapshotNow(world)];
  }, [world]);
  const activeSnapshot=snapshots.find(s=>s.year===selectedYear)??snapshots[snapshots.length-1];
  async function initialiseDatabase(){
    if (operation.current) return;
    operation.current = true; setRunning(true);
    try {
      const result=await invoke<DatabaseStatus>("initialize_database");
      setDatabase(result); setStatus(`SQLite ready: ${result.tableCount} tables, schema v${result.schemaVersion}.`);
    } catch(error){setStatus(`Database initialisation failed: ${String(error)}`);}
    finally { operation.current = false; setRunning(false); }
  }
  const canReplace = () => !operation.current && (!dirty || window.confirm("Discard unsaved changes to this world?"));
  function createWorld(){
    if (!canReplace()) return;
    const clean=Number.isSafeInteger(seed) ? Math.abs(seed) : 48291735;
    setWorld(generateWorld(clean)); setReadIds([]); setJumpBandId(undefined);
    setSelectedYear(0); setDirty(true);
    setStatus(`Created a new world from seed ${clean}. Save it to keep its history.`);
  }
  function resetWorld() {
    if (!canReplace()) return;
    setWorld(null); setReadIds([]); setJumpBandId(undefined); setDirty(false);
    setStatus("World cleared. Your saved worlds are still available.");
  }
  async function saveManual() {
    if (!world || operation.current) return;
    operation.current = true; setRunning(true);
    try { await saveWorld("manual", world, readIds); setDirty(false); setStatus(`World saved at week ${world.week}.`); }
    catch (error) { setStatus(`Save failed. Your world is still open: ${String(error)}`); }
    finally { operation.current = false; setRunning(false); }
  }
  async function restore(slot: SaveSlot) {
    if (!canReplace()) return;
    operation.current = true; setRunning(true);
    try {
      const save = await loadWorld(slot);
      setWorld(save.world); setReadIds(save.readEventIds); setSeed(save.world.seed);
      setSelectedYear(save.world.year); setJumpBandId(undefined); setPage(save.world.playerFestival ? "festival" : "news"); setDirty(false);
      setStatus(`Loaded ${slot === "manual" ? "manual save" : "autosave"} from week ${save.world.week}.`);
    } catch (error) { setStatus(`Load failed. Your current world is unchanged: ${String(error)}`); }
    finally { operation.current = false; setRunning(false); }
  }
  async function advance(targetWeek: number, showNews = false) {
    if (!world || operation.current || targetWeek <= world.week) return;
    if (pendingFestivalDecisions(world).length) {
      setPage("festival"); setStatus("Review the open case affecting your lineup before advancing."); return;
    }
    operation.current = true; setRunning(true);
    setStatus(`Advancing the industry to week ${targetWeek}…`);
    try {
      const next = structuredClone(world);
      while (next.week < targetWeek) {
        simulateWeek(next);
        if (pendingFestivalDecisions(next).length ||
            (world.playerFestival?.status === "planning" && next.playerFestival?.status === "completed")) break;
        if (next.week % 52 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }
      const added = next.events.length - world.events.length;
      setWorld(next); setSelectedYear(next.year); setDirty(true);
      if (pendingFestivalDecisions(next).length || (world.playerFestival?.status === "planning" && next.playerFestival?.status === "completed")) setPage("festival");
      else if (showNews) setPage("news");
      try {
        await saveWorld("autosave", next, readIds);
        setDirty(false);
        setStatus(`Week ${next.week}: ${added} new ${added === 1 ? "story" : "stories"}. Autosaved.`);
      } catch (error) { setStatus(`Week ${next.week} complete, but autosave failed. Use Save World to retry: ${String(error)}`); }
    } catch (error) { setStatus(`Simulation failed. Your previous world is unchanged: ${String(error)}`); }
    finally { operation.current = false; setRunning(false); }
  }
  async function applyAction(label: string, action: (next: WorldState) => void) {
    if (!world || operation.current) return;
    operation.current = true; setRunning(true);
    try {
      const next = structuredClone(world);
      action(next);
      setWorld(next); setDirty(true);
      try {
        await saveWorld("autosave", next, readIds);
        setDirty(false); setStatus(`${label}. Autosaved.`);
      } catch (error) { setStatus(`${label}, but autosave failed. Use Save World to retry: ${String(error)}`); }
    } catch (error) { setStatus(String(error)); }
    finally { operation.current = false; setRunning(false); }
  }
  function runToYear(target: number) { void advance(target * 52); }
  function openBand(id: string) { setJumpBandId(id); setPage("bands"); }
  const nav:[Page,string,string][]=[["festival","★","My Festival"],["news","▤","Industry News"],["lab","◫","Simulation Lab"],["world","◉","World Database"],["bands","♫","Bands & Members"],["people","♙","People"],["festivals","▥","Festivals"],["relationships","⌁","Relationships"],["reports","↗","Balance Reports"]];
  function jump(issue:ValidationIssue){if(issue.entityType==="band"&&issue.entityId){setJumpBandId(issue.entityId);setPage("bands");}}
  return <div className="app-shell"><aside className="sidebar"><div className="brand">HEADLINER<span>FESTIVAL DIRECTOR</span></div><nav>{nav.map(([key,icon,label])=><button key={key} className={page===key?"active":""} onClick={()=>setPage(key)}>{icon} {label}</button>)}</nav><div className={`database-card ${database?.ready?"ready":""}`}><span>SQLITE FOUNDATION</span><strong>{database?.ready?"READY":"NOT INITIALISED"}</strong><small>{database?.ready?`${database.tableCount} tables · schema v${database.schemaVersion}`:"Click initialise to create the local database."}</small><button onClick={initialiseDatabase} disabled={running}>{database?.ready?"Recheck Migrations":"Initialise Database"}</button></div></aside><main><header className="topbar"><div><span className="eyebrow">HEADLINER v0.0.4</span><h1>Your festival. Their world.</h1><p>Build your lineup, follow the stories, and make your mark on the music industry.</p></div><div className="header-status" role="status" aria-live="polite"><i></i>{status}</div></header>
  <section className="session-controls panel" aria-label="World controls">
    <div><strong>{world ? `Year ${world.year} · Week ${world.week}` : "Start your music world"}</strong>
      <small>{dirty ? "Unsaved changes" : world ? "Progress saved" : "Generate a world or load a save"}</small></div>
    <button className="primary" disabled={!world || running} onClick={() => void advance(world!.week + 1, true)}>Advance Week →</button>
    <button disabled={!world || running} onClick={() => void saveManual()}>Save World</button>
    <button disabled={running} onClick={() => void restore("manual")}>Load Save</button>
    <button disabled={running} onClick={() => void restore("autosave")}>Load Autosave</button>
  </section>
  {world && page === "festival" && <FestivalDesk key={world.seed} world={world} busy={running} onAction={(label, action) => void applyAction(label, action)} onBand={openBand} />}
  {world && page === "news" && <NewsFeed key={world.seed} world={world} readIds={readIds}
    onRead={ids => { if (!operation.current) { setReadIds(ids); setDirty(true); } }} onBand={openBand} onFestival={() => setPage("festival")} />}
  {page==="lab"&&<><section className="control-panel panel"><div className="control-copy"><span className="eyebrow">DETERMINISTIC WORLD</span><h2>Simulation Seed</h2><p>The same seed and simulation version produce the same initial world.</p></div><label>Seed<input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value))}/></label><button className="primary" onClick={createWorld} disabled={running}>Generate Test World</button><button className="secondary" onClick={resetWorld} disabled={running}>Reset</button></section><section className="world-metrics"><Metric label="Bands" value={world?String(world.bands.length):"20"}/><Metric label="Band Members" value={world?String(world.members.length):"60–100"}/><Metric label="Labels / Agents" value={world?`${world.labels.length} / ${world.agents.length}`:"4 / 10"}/><Metric label="Festivals" value={world?String(world.festivals.length):"4"}/><Metric label="Sponsors / Venues" value={world?`${world.sponsors.length} / ${world.venues.length}`:"5 / 8"}/><Metric label="Current Week" value={world?n(world.week):"0"}/></section><section className="simulation-actions panel"><div><span className="eyebrow">FAST-FORWARD CHECKPOINTS</span><h2>Run the world forward</h2></div>{[5,10,15,20].map(y=><button key={y} onClick={()=>runToYear(y)} disabled={running || !world || world.week >= y * 52}><strong>{y}</strong><span>YEARS</span></button>)}</section>{world&&activeSnapshot?<><div className="snapshot-strip">{snapshots.map(s=><button key={s.year} className={`snapshot-card ${s.year===activeSnapshot.year?"selected":""}`} onClick={()=>setSelectedYear(s.year)}><span>YEAR</span><strong>{s.year}</strong><small>{s.activeBands} bands · {s.activeFestivals} festivals</small></button>)}</div><section className="dashboard-grid"><div className="panel overview-panel"><div className="panel-heading"><h2>Industry Health</h2><span>Seed {world.seed}</span></div><div className="metric-grid"><Metric label="Active Bands" value={String(activeSnapshot.activeBands)} tone="good"/><Metric label="Band Splits" value={String(activeSnapshot.splitBands)} tone={activeSnapshot.splitBands>4?"warn":"default"}/><Metric label="Active Festivals" value={String(activeSnapshot.activeFestivals)} tone="good"/><Metric label="Festival Closures" value={String(activeSnapshot.closedFestivals)}/><Metric label="Average Popularity" value={d(activeSnapshot.averageBandPopularity)}/><Metric label="Average Festival Rep" value={d(activeSnapshot.averageFestivalReputation)}/></div></div><div className="panel ranking-panel"><div className="panel-heading"><h2>Top Bands</h2><span>Popularity</span></div>{activeSnapshot.topBands.map((b,i)=><div className="ranking-row" key={b.name}><b>{i+1}</b><div><strong>{b.name}</strong><small>{n(b.followers)} followers</small></div><span>{d(b.popularity)}</span></div>)}</div></section></>:<EmptyState onGenerate={createWorld}/>}</>}
  {page!=="lab"&&!world&&<EmptyState onGenerate={createWorld}/>} {world&&page==="world"&&<section className="report-page"><div className="browser-toolbar"><div><span className="eyebrow">WORLD DATABASE</span><h1>World Overview</h1><p>Seed {world.seed} · Year {world.year} · Week {world.week}</p></div></div><div className="report-metrics"><Metric label="Bands" value={String(world.bands.length)}/><Metric label="People" value={String(world.members.length+world.agents.length+world.staff.length)}/><Metric label="Festivals" value={String(world.festivals.length)}/><Metric label="Events" value={String(world.events.length)}/></div><div className="panel report-panel"><div className="panel-heading"><h2>Entity collections</h2><span>live memory</span></div>{[["Bands",world.bands.length],["Members",world.members.length],["Labels",world.labels.length],["Agents",world.agents.length],["Festivals",world.festivals.length],["Sponsors",world.sponsors.length],["Venues",world.venues.length],["Staff",world.staff.length]].map(([label,count])=><div className="collection-row" key={String(label)}><strong>{label}</strong><span>{count}</span></div>)}</div></section>}
  {world&&page==="bands"&&<BandInspector key={`${world.seed}-${jumpBandId ?? "browse"}`} world={world} initialId={jumpBandId}/>} {world&&page==="people"&&<BrowserLayout title="People" subtitle={`${world.members.length} musicians · ${world.agents.length} agents · ${world.staff.length} staff`} controls={<span className="filter-note">Unified people browser</span>} list={<table><thead><tr><th>Name</th><th>Type / role</th><th>Reputation / ability</th></tr></thead><tbody>{world.members.map(m=><tr key={m.id}><td><strong>{m.name}</strong><small>{m.age} · {m.status}</small></td><td>{m.role}</td><td>{m.currentAbility}</td></tr>)}{world.agents.map(a=><tr key={a.id}><td><strong>{a.name}</strong><small>Agent</small></td><td>{a.clientIds.length} clients</td><td>{a.reputation}</td></tr>)}</tbody></table>} detail={<p className="empty">Select-specific person profiles are the next expansion; this view already exposes the complete population.</p>}/>} {world&&page==="festivals"&&<FestivalInspector world={world}/>} {world&&page==="relationships"&&<BrowserLayout title="Relationships" subtitle="Member-to-member relationship graph records" controls={<span className="filter-note">Directional relationship values</span>} list={<table><thead><tr><th>Source</th><th>Target</th><th>Value</th></tr></thead><tbody>{world.members.flatMap(m=>Object.entries(m.relationships).map(([id,value])=><tr key={`${m.id}-${id}`}><td>{m.name}</td><td>{world.members.find(x=>x.id===id)?.name??id}</td><td>{value}</td></tr>)).slice(0,300)}</tbody></table>} detail={<p className="empty">Select a band in Bands & Members to inspect its internal relationship network in context.</p>}/>} {world&&page==="reports"&&<Reports world={world} onJump={jump}/>}</main></div>;
}
export default App;
