import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld } from "../src/core/generation/generateWorld";
import { decodeSave, encodeSave } from "../src/core/persistence/worldSave";
import { simulateWeek } from "../src/core/simulation/simulate";
import { arrestChance, startArrest } from "../src/core/simulation/arrests";
import { bookBand, cancelBand, createPlayerFestival, pendingFestivalDecisions,
  performanceAvailability, processPlayerFestival, respondToArrest, STARTING_CASH } from "../src/core/simulation/playerFestival";
import { SeededRng } from "../src/core/rng/SeededRng";

function setup() {
  const world = generateWorld(48291735);
  const venue = [...world.venues].sort((a, b) => a.rentalCost - b.rentalCost)[0];
  createPlayerFestival(world, "First Light", venue.id, world.bands[0].genre, "backstage_crisis");
  const band = [...world.bands].sort((a, b) => a.bookingFee - b.bookingFee)[0];
  bookBand(world, band.id);
  return { world, festival: world.playerFestival!, band, venue };
}

test("booking and cancellations have an exact, bounded cash ledger", () => {
  const { world, festival, band, venue } = setup();
  assert.equal(festival.cash, STARTING_CASH - venue.rentalCost - festival.operatingCost - Math.round(band.bookingFee));
  const before = JSON.stringify(world);
  assert.throws(() => bookBand(world, band.id), /already booked/);
  assert.equal(JSON.stringify(world), before);
  cancelBand(world, festival.bookings[0].id);
  assert.equal(festival.cash, STARTING_CASH - venue.rentalCost - festival.operatingCost - Math.ceil(band.bookingFee / 2));
  assert.equal(festival.bandTrust[band.id], 42);
  assert.throws(() => cancelBand(world, festival.bookings[0].id));
  assert.doesNotThrow(() => encodeSave(world));
});

test("a sold-out budget or full lineup cannot be bypassed", () => {
  const { world, festival } = setup();
  const cheapest = world.bands.filter(band => band.id !== festival.bookings[0].bandId).sort((a, b) => a.bookingFee - b.bookingFee);
  bookBand(world, cheapest[0].id); bookBand(world, cheapest[1].id);
  const before = JSON.stringify(world);
  assert.throws(() => bookBand(world, cheapest[2].id), /slots/);
  assert.equal(JSON.stringify(world), before);
  const other = setup();
  const expensive = other.world.bands.find(band => band.id !== other.band.id)!;
  expensive.bookingFee = other.festival.cash + 1;
  assert.throws(() => bookBand(other.world, expensive.id), /budget/);
});

test("the challenge creates a persistent arrest before opening and keeping it builds trust", () => {
  const { world, festival, band } = setup();
  while (world.week < 4) simulateWeek(world);
  assert.equal(festival.scenarioTriggered, true);
  const pending = pendingFestivalDecisions(world).find(item => item.booking.bandId === band.id)!;
  assert.ok(pending);
  assert.ok(world.events.some(event => event.type === "member_arrested"));
  const restored = decodeSave(encodeSave(world)).world;
  assert.deepEqual(pendingFestivalDecisions(restored), pendingFestivalDecisions(world));
  respondToArrest(restored, pending.booking.id, pending.incident.id, "keep");
  assert.equal(restored.playerFestival!.bandTrust[band.id], 58);
  assert.equal(pendingFestivalDecisions(restored).length, 0);
  assert.throws(() => respondToArrest(restored, pending.booking.id, pending.incident.id, "keep"));
  assert.doesNotThrow(() => encodeSave(restored));
});

test("replacement failures are atomic; successful replacement pays both contract costs", () => {
  const { world, festival, band } = setup();
  const singer = world.members.find(member => band.memberIds.includes(member.id) && member.role === "Lead Vocalist")!;
  startArrest(world, singer.id);
  const pending = pendingFestivalDecisions(world)[0];
  const before = JSON.stringify(world);
  assert.throws(() => respondToArrest(world, pending.booking.id, pending.incident.id, "replace", band.id));
  assert.equal(JSON.stringify(world), before);
  const replacement = world.bands.filter(item => item.id !== band.id).sort((a, b) => a.bookingFee - b.bookingFee)[0];
  const cash = festival.cash;
  respondToArrest(world, pending.booking.id, pending.incident.id, "replace", replacement.id);
  assert.equal(festival.cash, cash + Math.floor(pending.booking.fee / 2) - Math.round(replacement.bookingFee));
  assert.equal(pending.booking.status, "cancelled");
  assert.equal(festival.bandTrust[band.id], 47);
  assert.equal(pendingFestivalDecisions(world).length, 0);
  assert.doesNotThrow(() => encodeSave(world));
});

test("cancelling an affected act refunds only half and resolves the decision", () => {
  const { world, festival, band } = setup();
  startArrest(world, band.memberIds[0]);
  const pending = pendingFestivalDecisions(world)[0];
  const cash = festival.cash;
  respondToArrest(world, pending.booking.id, pending.incident.id, "cancel");
  assert.equal(festival.cash, cash + Math.floor(pending.booking.fee / 2));
  assert.equal(festival.reputation, 28);
  assert.equal(pendingFestivalDecisions(world).length, 0);
});

test("detention and injury both affect actual sets; the edition settles only once", () => {
  const { world, festival, band } = setup();
  const singer = world.members.find(member => band.memberIds.includes(member.id) && member.role === "Lead Vocalist")!;
  startArrest(world, singer.id);
  assert.equal(performanceAvailability(world, band).canPerform, false);
  respondToArrest(world, festival.bookings[0].id, world.arrestCases[0].id, "keep");
  world.week = festival.eventWeek; world.year = 1;
  processPlayerFestival(world, new SeededRng(1));
  assert.deepEqual(festival.result!.missedBandIds, [band.id]);
  assert.equal(festival.cash, STARTING_CASH + festival.result!.profit);
  assert.ok(festival.result!.attendance <= festival.capacity);
  const before = JSON.stringify(world);
  processPlayerFestival(world, new SeededRng(1));
  assert.equal(JSON.stringify(world), before);
  assert.doesNotThrow(() => encodeSave(world));
  const healthy = setup();
  const musician = healthy.world.members.find(member => healthy.band.memberIds.includes(member.id) && member.role === "Lead Vocalist")!;
  musician.weeksUnavailable = 2;
  assert.equal(performanceAvailability(healthy.world, healthy.band).canPerform, false);
});

test("arrest probability responds to conduct, and the court record resolves without rerolling saves", () => {
  const { world, band } = setup();
  const member = world.members.find(item => band.memberIds.includes(item.id))!;
  assert.ok(arrestChance({ ...member, riskTaking: 20, stress: 90, professionalism: 1, pastIncidents: 4 }) >
    arrestChance({ ...member, riskTaking: 1, stress: 0, professionalism: 20, pastIncidents: 0 }));
  startArrest(world, member.id);
  const previous = world.members.find(item => band.memberIds.includes(item.id) && item.id !== member.id)!;
  assert.ok(previous.relationships[member.id] < 100);
  const saved = decodeSave(encodeSave(world)).world;
  for (let i = 0; i < 8; i++) { simulateWeek(world); simulateWeek(saved); }
  assert.equal(JSON.stringify(saved), JSON.stringify(world));
  assert.ok(!world.arrestCases[0].active);
  assert.ok(world.events.some(event => ["member_cleared", "member_fined"].includes(event.type)));
});

test("old saves migrate without losing their history or consuming random state", () => {
  const world = generateWorld(1);
  for (let i = 0; i < 3; i++) simulateWeek(world);
  const old = JSON.parse(encodeSave(world));
  old.version = 1; old.simulationVersion = "0.0.3";
  delete old.world.playerFestival; delete old.world.arrestCases;
  for (const member of old.world.members) {
    delete member.riskTaking; delete member.stress; delete member.pastIncidents;
  }
  // A version-1 world cannot contain the newly introduced arrest events.
  old.world.events = old.world.events.filter((event: { type: string }) => !["member_arrested", "member_bailed", "member_remanded", "member_fined", "member_cleared"].includes(event.type));
  const migrated = decodeSave(JSON.stringify(old));
  assert.equal(migrated.version, 2);
  assert.equal(migrated.world.rngState, old.world.rngState);
  assert.deepEqual(migrated.world.events, old.world.events);
  assert.equal(migrated.world.playerFestival, null);
  assert.deepEqual(migrated.world.arrestCases, []);
  assert.ok(migrated.world.members.every(member => member.riskTaking >= 1));
  assert.doesNotThrow(() => encodeSave(migrated.world));
});

test("corrupt new records and money ledgers are rejected", () => {
  const { world, festival, band } = setup();
  const payload = JSON.parse(encodeSave(world));
  payload.world.playerFestival.cash += 100;
  assert.throws(() => decodeSave(JSON.stringify(payload)), /ledger/);
  const clean = JSON.parse(encodeSave(world));
  clean.world.arrestCases = null;
  assert.throws(() => decodeSave(JSON.stringify(clean)));
  startArrest(world, band.memberIds[0]);
  festival.decisions.push({ bookingId: festival.bookings[0].id, caseId: "missing", choice: "keep", week: 0 });
  assert.throws(() => encodeSave(world), /missing entity/);
});
