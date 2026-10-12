import { useState } from "react";
import type { WorldState } from "./core/domain/models";
import type { FestivalBooking } from "./core/domain/playerFestival";
import { bookBand, cancelBand, createPlayerFestival, festivalSiteCost, MAX_BOOKINGS, money,
  pendingFestivalDecisions, performanceAvailability, respondToArrest, STARTING_CASH } from "./core/simulation/playerFestival";

interface Props {
  world: WorldState;
  busy: boolean;
  onAction: (label: string, action: (world: WorldState) => void) => void;
  onBand: (id: string) => void;
}

export function FestivalDesk({ world, busy, onAction, onBand }: Props) {
  const [name, setName] = useState("First Light");
  const [venueId, setVenueId] = useState(() => [...world.venues].sort((a, b) => a.rentalCost - b.rentalCost)[0]?.id ?? "");
  const [genre, setGenre] = useState(world.bands[0]?.genre ?? "");
  const [query, setQuery] = useState("");
  const festival = world.playerFestival;
  if (!festival) {
    const site = festivalSiteCost(world, venueId);
    return <section className="festival-desk">
      <span className="eyebrow">YOUR FIRST EDITION</span><h1>Build your festival</h1>
      <p>Six weeks. Three acts. A living industry that keeps moving around you.</p>
      <div className="panel festival-setup">
        <label>Festival name<input maxLength={60} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Venue<select value={venueId} onChange={event => setVenueId(event.target.value)}>
          {[...world.venues].sort((a, b) => a.rentalCost - b.rentalCost).map(venue =>
            <option value={venue.id} key={venue.id}>{venue.name} · {money(venue.rentalCost)} hire</option>)}
        </select></label>
        <label>Musical identity<select value={genre} onChange={event => setGenre(event.target.value)}>
          {[...new Set(world.bands.map(band => band.genre))].sort().map(item => <option key={item}>{item}</option>)}
        </select></label>
        <div className="festival-budget"><p>Starting funds <strong>{money(STARTING_CASH)}</strong></p>
          <p>Site hire + operations <strong>{money(site.total)}</strong></p>
          <p>Available for acts <strong>{money(STARTING_CASH - site.total)}</strong></p>
          <p>{site.capacity.toLocaleString("en-GB")} capacity · £125 tickets · Event in week {world.week + 6}</p></div>
        <button className="primary" disabled={busy || !name.trim() || site.total >= STARTING_CASH}
          onClick={() => onAction("Festival created", next => createPlayerFestival(next, name, venueId, genre, "standard"))}>Start my festival</button>
        <div className="challenge-intro"><h2>Try the backstage crisis</h2>
          <p>This challenge guarantees an arrest involving a booked band two weeks before opening. Build your lineup, then decide whether to stand by the act, cancel or find a replacement.</p>
          <button disabled={busy || !name.trim() || site.total >= STARTING_CASH}
            onClick={() => onAction("Backstage crisis challenge started", next => createPlayerFestival(next, name, venueId, genre, "backstage_crisis"))}>Start backstage crisis</button>
        </div>
      </div>
    </section>;
  }
  const venue = world.venues.find(item => item.id === festival.venueId)!;
  const pending = pendingFestivalDecisions(world);
  const lineup = festival.bookings.filter(booking => booking.status !== "cancelled");
  const result = festival.result;
  const candidates = world.bands.filter(band => band.status === "active" &&
    !lineup.some(booking => booking.bandId === band.id) &&
    `${band.name} ${band.genre}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.bookingFee - b.bookingFee);
  return <section className="festival-desk">
    <div className="browser-toolbar"><div><span className="eyebrow">{festival.scenario === "backstage_crisis" ? "BACKSTAGE CRISIS CHALLENGE" : "FESTIVAL DIRECTOR"}</span>
      <h1>{festival.name}</h1><p>{venue.name} · {festival.genreFocus} · Week {festival.eventWeek}</p></div>
      <strong>{festival.status === "completed" ? "Edition complete" : `${festival.eventWeek - world.week} weeks to opening`}</strong>
    </div>
    <div className="report-metrics">
      <Stat label="Available cash" value={money(festival.cash)} />
      <Stat label="Lineup" value={`${lineup.length} / ${MAX_BOOKINGS}`} />
      <Stat label="Reputation" value={`${festival.reputation} / 100`} />
      <Stat label="Capacity" value={festival.capacity.toLocaleString("en-GB")} />
    </div>
    {pending.length > 0 && <div className="crisis-banner" role="status"><strong>Your lineup needs a decision.</strong>
      <p>An open case affects a booked act. Review it below before advancing the week.</p></div>}
    {result && <div className="panel festival-results"><span className="eyebrow">THE MORNING AFTER</span><h2>Your first festival, in the history books</h2>
      <div className="report-metrics"><Stat label="Fans through the gate" value={result.attendance.toLocaleString("en-GB")} />
        <Stat label="Ticket revenue" value={money(result.revenue)} /><Stat label="Total costs" value={money(result.costs)} />
        <Stat label={result.profit >= 0 ? "Profit" : "Loss"} value={money(Math.abs(result.profit))} /></div>
      <p>Reputation {result.reputationChange >= 0 ? "+" : ""}{result.reputationChange}. {result.performedBandIds.length} acts performed; {result.missedBandIds.length} missed their sets.</p>
      <p>Attendance reflects the acts who could perform, their popularity and live strength, genre fit and missing sets. Costs include site hire, operations, guaranteed fees and cancellation losses.</p>
    </div>}
    <div className="festival-grid"><div className="panel festival-lineup"><h2>Your lineup</h2>
      <p>Fees are guaranteed and paid now. Cancelling returns half the fee; a replacement is a new booking.</p>
      {lineup.map(booking => <BookingCard key={booking.id} booking={booking} {...{ world, busy, onAction, onBand }} />)}
      {!lineup.length && <p className="empty">Choose your first act from the artist list. An empty lineup will struggle to draw a crowd.</p>}
      {festival.bookings.filter(booking => booking.status === "cancelled").map(booking => <p key={booking.id} className="cancelled-booking">
        Cancelled: {world.bands.find(band => band.id === booking.bandId)?.name} · {money(Math.ceil(booking.fee / 2))} forfeited
      </p>)}
    </div>{festival.status === "planning" && <div className="panel festival-artists"><h2>Find your acts</h2>
      <label>Search artists<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Band or genre…" /></label>
      {candidates.map(band => {
        const availability = performanceAvailability(world, band);
        return <article className="artist-option" key={band.id}><div><h3>{band.name}</h3>
          <p>{band.genre} · {band.homeCity}</p><small>{availability.canPerform ? "Currently able to perform" : "Current availability at risk"} · Popularity {Math.round(band.popularity)}</small></div>
          <strong>{money(band.bookingFee)}</strong>
          <div><button onClick={() => onBand(band.id)}>View band</button>
            <button disabled={busy || lineup.length >= MAX_BOOKINGS || Math.round(band.bookingFee) > festival.cash}
              onClick={() => onAction(`Booked ${band.name}`, next => bookBand(next, band.id))}>Book act</button></div></article>;
      })}
      {!candidates.length && <p className="empty">No artists match your search.</p>}
    </div>}</div>
  </section>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function BookingCard({ booking, world, busy, onAction, onBand }: Props & { booking: FestivalBooking }) {
  const [replacementId, setReplacementId] = useState("");
  const festival = world.playerFestival!;
  const band = world.bands.find(item => item.id === booking.bandId)!;
  const availability = performanceAvailability(world, band);
  const pending = pendingFestivalDecisions(world).filter(item => item.booking.id === booking.id);
  const replacementBudget = festival.cash + Math.floor(booking.fee / 2);
  const replacements = world.bands.filter(item => item.id !== band.id &&
    !festival.bookings.some(existing => existing.bandId === item.id && existing.status === "booked") &&
    performanceAvailability(world, item).canPerform &&
    !world.arrestCases.some(incident => incident.bandId === item.id && incident.active) &&
    Math.round(item.bookingFee) <= replacementBudget).sort((a, b) => a.bookingFee - b.bookingFee);
  return <article className="booking-card"><h3>{band.name}</h3><p>{band.genre} · Guaranteed fee {money(booking.fee)}</p>
    <p>Trust {festival.bandTrust[band.id] ?? 50} / 100 · {booking.status === "booked"
      ? `${availability.available}/${availability.total} members available now` : booking.status === "missed" ? "Missed their set" : "Performed"}</p>
    <button onClick={() => onBand(band.id)}>View band →</button>
    {pending.map(({ incident }) => {
      const member = world.members.find(item => item.id === incident.memberId)!;
      return <div className="booking-crisis" key={incident.id}><h4>{member.name}'s open case</h4>
        <p>{incident.status === "detained" ? "Currently detained and unable to perform." : "Released on bail; the allegation remains unresolved."} Next hearing: week {incident.nextHearingWeek}. An arrest is not a verdict.</p>
        <p>Keep the act: trust +8, full fee remains at risk. Cancel: half-fee refund, trust −8 and reputation −2. Replace: half-fee refund, trust −3 with the original act, plus the new act's fee.</p>
        <div className="crisis-actions">
          <button disabled={busy} onClick={() => onAction("You stood by the band", next => respondToArrest(next, booking.id, incident.id, "keep"))}>Keep booking</button>
          <button disabled={busy} onClick={() => onAction("Booking cancelled", next => respondToArrest(next, booking.id, incident.id, "cancel"))}>Cancel booking</button>
        </div>
        <label>Replacement act<select value={replacementId} onChange={event => setReplacementId(event.target.value)}>
          <option value="">Choose a replacement…</option>
          {replacements.map(item => <option key={item.id} value={item.id}>{item.name} · {money(item.bookingFee)}</option>)}
        </select></label>
        <button disabled={busy || !replacements.some(item => item.id === replacementId)}
          onClick={() => onAction("Replacement act confirmed", next => respondToArrest(next, booking.id, incident.id, "replace", replacementId))}>Confirm replacement</button>
        {!replacements.length && <p>No affordable act is currently ready to replace them.</p>}
      </div>;
    })}
    {booking.status === "booked" && !pending.length && <button disabled={busy}
      onClick={() => onAction("Booking cancelled", next => cancelBand(next, booking.id))}>Cancel · {money(Math.floor(booking.fee / 2))} refund</button>}
    {festival.decisions.filter(decision => decision.bookingId === booking.id).map(decision =>
      <small className="decision-memory" key={decision.caseId}>Week {decision.week}: {decision.choice === "keep" ? "You stood by this act." : `You chose to ${decision.choice} this act.`}</small>)}
  </article>;
}
