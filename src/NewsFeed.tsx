import { useMemo, useState } from "react";
import type { WorldState } from "./core/domain/models";
import { newsCategory, newsHeadline, storyHistory, type NewsCategory } from "./core/news/news";

interface Props {
  world: WorldState;
  readIds: string[];
  onRead: (ids: string[]) => void;
  onBand: (id: string) => void;
}

export function NewsFeed({ world, readIds, onRead, onBand }: Props) {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const read = useMemo(() => new Set(readIds), [readIds]);
  const events = useMemo(() => world.events.filter(event =>
    (category === "all" || newsCategory(event) === category) &&
    (!unreadOnly || !read.has(event.id)) &&
    event.summary.toLowerCase().includes(query.toLowerCase())).reverse(),
    [world, category, unreadOnly, query, read]);
  const activeStories = world.storyArcs.filter(arc => arc.active);
  return <section className="report-page news-page">
    <div className="browser-toolbar"><div><span className="eyebrow">THE HEADLINER WIRE</span>
      <h1>Industry News</h1><p>Week {world.week} · {world.events.filter(event => !read.has(event.id)).length} unread stories</p>
    </div><button onClick={() => onRead(world.events.map(event => event.id))} disabled={!world.events.some(event => !read.has(event.id))}>Mark all as read</button></div>
    <div className="news-controls">
      <input aria-label="Search news" placeholder="Search people, bands or stories…" value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(50); }} />
      <select aria-label="News category" value={category} onChange={event => { setCategory(event.target.value as NewsCategory | "all"); setVisibleCount(50); }}>
        <option value="all">All news</option><option value="people">People & bands</option>
        <option value="industry">Music industry</option><option value="festivals">Festivals</option>
      </select>
      <label><input type="checkbox" checked={unreadOnly} onChange={event => setUnreadOnly(event.target.checked)} /> Unread only</label>
    </div>
    <div className="news-grid"><div className="panel report-panel">
      {events.slice(0, visibleCount).map(event => <article className={`news-story ${read.has(event.id) ? "read" : "unread"}`} key={event.id}>
        <small>Year {event.year} · Week {((event.week - 1) % 52) + 1} · {newsCategory(event)}{event.severity >= 4 ? " · Major story" : ""}</small>
        <h2>{newsHeadline(event)}</h2><p>{event.summary}</p>
        <div className="news-links">{world.bands.filter(band => event.entityIds.includes(band.id)).map(band =>
          <button key={band.id} onClick={() => onBand(band.id)}>{band.name} →</button>)}
          {!read.has(event.id) && <button onClick={() => onRead([...readIds, event.id])}>Mark as read</button>}
        </div>
      </article>)}
      {!events.length && <p className="empty">{world.week === 0 ? "Advance a week to discover what happens in your world." : "No stories match these filters. Some weeks are quiet; the world keeps moving."}</p>}
      {events.length > visibleCount && <button onClick={() => setVisibleCount(count => count + 50)}>Older stories ({events.length - visibleCount})</button>}
    </div><aside className="panel report-panel">
      <h2>Stories unfolding</h2><p>Disputes still working their way through the industry.</p>
      {activeStories.map(arc => {
        const band = world.bands.find(candidate => arc.participantIds.includes(candidate.id));
        const history = storyHistory(world, arc.participantIds).filter(event => event.week <= world.week);
        return <div className="story-arc" key={arc.id}>
          <h3>{band?.name ?? "Industry storyline"}</h3>
          <p>{arc.stage === 0 ? "Tension has surfaced. What happens next depends on the people involved." : "The dispute has escalated. Reconciliation or a departure could follow."}</p>
          {history.slice(-2).map(event => <p key={event.id}><small>Week {event.week}</small> {event.summary}</p>)}
          {band && <button onClick={() => onBand(band.id)}>View band →</button>}
        </div>;
      })}
      {!activeStories.length && <p className="empty">No developing disputes at the moment.</p>}
    </aside></div>
  </section>;
}
