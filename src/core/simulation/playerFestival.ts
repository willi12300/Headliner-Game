import type { Band, WorldState } from "../domain/models";
import type { ArrestCase, FestivalBooking, PlayerFestival } from "../domain/playerFestival";
import { average, clamp, SeededRng } from "../rng/SeededRng";
import { isDetained } from "./arrests";
import { recordEvent } from "./events";

export const STARTING_CASH = 350_000;
export const MAX_BOOKINGS = 3;
export const money = (value: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 0,
}).format(value);

export function festivalSiteCost(world: WorldState, venueId: string) {
  const venue = world.venues.find(item => item.id === venueId);
  if (!venue) throw new Error("This venue does not exist.");
  const capacity = Math.min(3000, venue.capacity);
  const operatingCost = capacity * 12;
  return { venue, capacity, operatingCost, total: venue.rentalCost + operatingCost };
}

export function createPlayerFestival(world: WorldState, name: string, venueId: string,
  genreFocus: string, scenario: PlayerFestival["scenario"]): void {
  if (world.playerFestival) throw new Error("This world already has a player festival.");
  if (!name.trim() || name.trim().length > 60) throw new Error("Choose a festival name of 1–60 characters.");
  if (!world.bands.some(band => band.genre === genreFocus)) throw new Error("Choose a genre from this world.");
  if (!["standard", "backstage_crisis"].includes(scenario)) throw new Error("Unknown scenario.");
  const site = festivalSiteCost(world, venueId);
  if (site.total >= STARTING_CASH) throw new Error("This site leaves no money for a lineup.");
  world.playerFestival = {
    id: "player_festival", name: name.trim(), venueId, genreFocus, eventWeek: world.week + 6,
    capacity: site.capacity, ticketPrice: 125, startingCash: STARTING_CASH,
    cash: STARTING_CASH - site.total, operatingCost: site.operatingCost, reputation: 30,
    status: "planning", scenario, scenarioTriggered: false, bookings: [], decisions: [],
    bandTrust: {}, result: null,
  };
  recordEvent(world, "festival_founded", 2, [world.playerFestival.id],
    `${name.trim()} announced its first edition at ${site.venue.name} in week ${world.playerFestival.eventWeek}.`);
}

function planningFestival(world: WorldState): PlayerFestival {
  const festival = world.playerFestival;
  if (!festival || festival.status !== "planning" || world.week >= festival.eventWeek)
    throw new Error("Bookings are closed for this edition.");
  return festival;
}

export function performanceAvailability(world: WorldState, band: Band): { canPerform: boolean; available: number; total: number } {
  const members = world.members.filter(member => band.memberIds.includes(member.id) && member.status === "active");
  const available = members.filter(member => member.weeksUnavailable === 0 && !isDetained(world, member.id));
  const missingSinger = members.some(member => member.role === "Lead Vocalist" && !available.includes(member));
  return { canPerform: band.status === "active" && available.length >= 2 && !missingSinger,
    available: available.length, total: members.length };
}

function bookingCandidate(world: WorldState, festival: PlayerFestival, bandId: string): Band {
  const band = world.bands.find(item => item.id === bandId);
  if (!band || band.status !== "active") throw new Error("This band is not available for booking.");
  if (festival.bookings.some(item => item.bandId === bandId && item.status === "booked"))
    throw new Error("This band is already booked.");
  return band;
}

function addBooking(world: WorldState, festival: PlayerFestival, band: Band): void {
  const fee = Math.round(band.bookingFee);
  festival.cash -= fee;
  festival.bookings.push({
    id: `booking_${festival.bookings.length + 1}`, bandId: band.id, fee, status: "booked",
  });
  festival.bandTrust[band.id] ??= 50;
  recordEvent(world, "festival_player_booking", 2, [festival.id, band.id],
    `${festival.name} booked ${band.name} for ${money(fee)}. The guaranteed fee is paid up front.`);
}

export function bookBand(world: WorldState, bandId: string): void {
  const festival = planningFestival(world);
  const band = bookingCandidate(world, festival, bandId);
  if (festival.bookings.filter(item => item.status === "booked").length >= MAX_BOOKINGS)
    throw new Error("All three lineup slots are filled.");
  if (Math.round(band.bookingFee) > festival.cash) throw new Error("This fee exceeds your remaining budget.");
  addBooking(world, festival, band);
}

export function bookingIncidents(world: WorldState, booking: FestivalBooking): ArrestCase[] {
  return world.arrestCases.filter(item => item.bandId === booking.bandId && item.active);
}

export function pendingFestivalDecisions(world: WorldState): Array<{ booking: FestivalBooking; incident: ArrestCase }> {
  const festival = world.playerFestival;
  if (!festival || festival.status !== "planning") return [];
  return festival.bookings.filter(item => item.status === "booked").flatMap(booking =>
    bookingIncidents(world, booking).filter(incident =>
      !festival.decisions.some(decision => decision.bookingId === booking.id && decision.caseId === incident.id))
      .map(incident => ({ booking, incident })));
}

function cancelBooking(world: WorldState, festival: PlayerFestival, booking: FestivalBooking, replacing = false): void {
  booking.status = "cancelled";
  const refund = Math.floor(booking.fee / 2);
  festival.cash += refund;
  festival.bandTrust[booking.bandId] = clamp((festival.bandTrust[booking.bandId] ?? 50) - (replacing ? 3 : 8), 0, 100);
  festival.reputation = clamp(festival.reputation - (replacing ? 0 : 2), 0, 100);
  const band = world.bands.find(item => item.id === booking.bandId)!;
  recordEvent(world, "festival_booking_cancelled", 3, [festival.id, band.id],
    `${festival.name} cancelled ${band.name}'s appearance. ${money(refund)} was refunded; the remaining fee is forfeited. Their trust in the festival fell.`);
}

export function cancelBand(world: WorldState, bookingId: string): void {
  const festival = planningFestival(world);
  const booking = festival.bookings.find(item => item.id === bookingId && item.status === "booked");
  if (!booking) throw new Error("This booking is no longer active.");
  cancelBooking(world, festival, booking);
}

export function respondToArrest(world: WorldState, bookingId: string, caseId: string,
  choice: "keep" | "cancel" | "replace", replacementBandId?: string): void {
  const festival = planningFestival(world);
  const pending = pendingFestivalDecisions(world).find(item => item.booking.id === bookingId && item.incident.id === caseId);
  if (!pending) throw new Error("This incident has already been addressed or resolved.");
  if (!["keep", "cancel", "replace"].includes(choice)) throw new Error("Unknown booking decision.");
  let replacement: Band | undefined;
  if (choice === "replace") {
    if (!replacementBandId || replacementBandId === pending.booking.bandId)
      throw new Error("Choose a different replacement act.");
    replacement = bookingCandidate(world, festival, replacementBandId);
    if (!performanceAvailability(world, replacement).canPerform || world.arrestCases.some(item => item.bandId === replacement!.id && item.active))
      throw new Error("Choose a replacement act that is currently ready to perform with no open case.");
    if (Math.round(replacement.bookingFee) > festival.cash + Math.floor(pending.booking.fee / 2))
      throw new Error("You cannot afford this replacement, even with the cancellation refund.");
  }
  festival.decisions.push({ bookingId, caseId, choice, week: world.week });
  const band = world.bands.find(item => item.id === pending.booking.bandId)!;
  if (choice === "keep") {
    festival.bandTrust[band.id] = clamp((festival.bandTrust[band.id] ?? 50) + 8, 0, 100);
    recordEvent(world, "festival_booking_kept", 2, [festival.id, band.id, pending.incident.memberId],
      `${festival.name} stood by ${band.name}. The band trusts the festival more, but the fee remains at risk if they cannot perform.`);
  } else {
    cancelBooking(world, festival, pending.booking, choice === "replace");
    if (replacement) {
      addBooking(world, festival, replacement);
      recordEvent(world, "festival_act_replaced", 2, [festival.id, band.id, replacement.id],
        `${replacement.name} will replace ${band.name} at ${festival.name}. The revised lineup is confirmed.`);
    }
  }
}

export function processPlayerFestival(world: WorldState, rng: SeededRng): void {
  const festival = world.playerFestival;
  if (!festival || festival.status !== "planning" || world.week < festival.eventWeek) return;
  const lineup = festival.bookings.filter(item => item.status === "booked");
  const performed: Band[] = [];
  const missed: Band[] = [];
  for (const booking of lineup) {
    const band = world.bands.find(item => item.id === booking.bandId)!;
    const ready = performanceAvailability(world, band).canPerform;
    booking.status = ready ? "performed" : "missed";
    (ready ? performed : missed).push(band);
    festival.bandTrust[band.id] = clamp((festival.bandTrust[band.id] ?? 50) + (ready ? 3 : -4), 0, 100);
  }
  const appeal = average(performed.map(band => band.popularity * 0.6 + band.livePerformance * 0.4));
  const genreFit = performed.filter(band => band.genre === festival.genreFocus).length;
  const demand = clamp(0.1 + performed.length * 0.13 + appeal / 200 + genreFit * 0.035 -
    missed.length * 0.12 + rng.float(-0.05, 0.05), 0.05, 1);
  const attendance = Math.round(festival.capacity * demand);
  const revenue = attendance * festival.ticketPrice;
  const costs = festival.startingCash - festival.cash;
  const profit = revenue - costs;
  const reputationChange = Math.round(clamp((demand - 0.55) * 20 + performed.length * 2 - missed.length * 7, -20, 15));
  festival.cash += revenue;
  festival.reputation = clamp(festival.reputation + reputationChange, 0, 100);
  festival.status = "completed";
  festival.result = { attendance, revenue, costs, profit, reputationChange,
    performedBandIds: performed.map(band => band.id), missedBandIds: missed.map(band => band.id) };
  recordEvent(world, "festival_player_result", missed.length ? 4 : 2, [festival.id, ...performed.map(band => band.id), ...missed.map(band => band.id)],
    `${festival.name} welcomed ${attendance.toLocaleString("en-GB")} fans. ${performed.length} acts performed and ${missed.length} missed their sets. The edition made a ${profit >= 0 ? "profit" : "loss"} of ${money(Math.abs(profit))}.`);
}
