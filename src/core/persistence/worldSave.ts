import type { WorldState } from "../domain/models";
import { conductDefaults } from "../simulation/arrests";

export const SAVE_VERSION = 2;
export const SIMULATION_VERSION = "0.0.4";
export interface WorldSave {
  format: "headliner-world";
  version: number;
  simulationVersion: string;
  savedAt: string;
  world: WorldState;
  readEventIds: string[];
}

type Shape = "string" | "number" | "boolean" | { [key: string]: Shape } | [Shape];
const fields = (names: string, type: Shape): Record<string, Shape> =>
  Object.fromEntries(names.split(" ").map(name => [name, type]));
const identity = fields("id name", "string");
const entity = { ...identity, status: "string" as const };
const metric: Shape = {
  value: "number", formula: "string",
  components: [{ label: "string", sourceValue: "number", weight: "number", contribution: "number" }],
};
const worldShape: Shape = {
  ...fields("seed rngState week year", "number"),
  bands: [{
    ...entity, ...fields("genre homeCity labelId agentId", "string"),
    ...fields("currentAbility potentialAbility overallQuality growthCeiling livePerformance catalogueQuality reputation commercialAppeal fanLoyalty festivalDraw bookingFee popularity momentum chemistry morale fatigue financialHealth followers ticketDraw professionalism ambition loyalty ego resilience socialInfluence viralPotential liveAbility festivalSuitability", "number"),
    ...fields("memberIds traits activeArcIds", ["string"]), isWonderband: "boolean",
    derived: fields("overallQuality growthCeiling livePerformance catalogueQuality chemistry professionalism reputation commercialAppeal fanLoyalty festivalDraw popularity momentum followers bookingFee", metric),
  }],
  members: [{
    ...entity, ...fields("bandId role", "string"), traits: ["string"],
    ...fields("age currentAbility potentialAbility vocals instrumentSkill songwriting creativity stagePresence professionalism ambition loyalty ego resilience leadership health fatigue morale injurySusceptibility weeksUnavailable", "number"),
    relationships: {},
  }],
  agents: [{ ...identity, ...fields("reputation negotiation contacts patience greed loyalty aggression honesty professionalism", "number"), clientIds: ["string"] }],
  labels: [{ ...entity, ...fields("reputation cashReserves debt riskTolerance discoveryFocus commercialFocus developmentQuality", "number"), rosterIds: ["string"] }],
  festivals: [{ ...entity, ...fields("genreFocus type", "string"), ...fields("capacity attendance cashReserves debt reputation discoveryReputation authenticity commercialism safetyReputation productionQuality riskTolerance aggression expansionAmbition followers", "number"), bookedBandIds: ["string"] }],
  sponsors: [{ ...entity, ...fields("annualBudget fanApproval brandReputation audienceMatch", "number") }],
  venues: [{ ...identity, type: "string", ...fields("capacity rentalCost transportQuality drainage councilDifficulty floodRisk brandPotential", "number") }],
  staff: [{ ...entity, role: "string", ...fields("reputation judgement potentialAssessment negotiation operations loyalty ambition", "number") }],
  storyArcs: [{ id: "string", type: "string", participantIds: ["string"], ...fields("stage severity nextEvaluationWeek", "number"), active: "boolean" }],
  events: [{ ...fields("id type summary", "string"), ...fields("week year severity", "number"), entityIds: ["string"] }],
  snapshots: [{
    ...fields("year activeBands splitBands activeFestivals closedFestivals totalFollowers averageBandPopularity averageFestivalReputation viralMoments memberDepartures injuries", "number"),
    topBands: [{ name: "string", popularity: "number", followers: "number" }],
    topFestivals: [{ name: "string", reputation: "number", capacity: "number" }],
  }],
};

const arrestShape: Shape = {
  ...fields("id memberId bandId status", "string"),
  ...fields("startedWeek nextHearingWeek stage", "number"), active: "boolean",
};
const playerShape: Shape = {
  ...fields("id name venueId genreFocus status scenario", "string"),
  ...fields("eventWeek capacity ticketPrice startingCash cash operatingCost reputation", "number"),
  scenarioTriggered: "boolean",
  bookings: [{ ...fields("id bandId status", "string"), fee: "number" }],
  decisions: [{ ...fields("caseId bookingId choice", "string"), week: "number" }],
  bandTrust: {},
};
const resultShape: Shape = {
  ...fields("attendance revenue costs profit reputationChange", "number"),
  ...fields("performedBandIds missedBandIds", ["string"]),
};

function check(value: unknown, shape: Shape, path: string): void {
  if (typeof shape === "string") {
    if (typeof value !== shape || (shape === "number" && !Number.isFinite(value)))
      throw new Error(`Invalid save field: ${path}.`);
  } else if (Array.isArray(shape)) {
    if (!Array.isArray(value)) throw new Error(`Invalid save list: ${path}.`);
    value.forEach((item, i) => check(item, shape[0], `${path}[${i}]`));
  } else {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error(`Invalid save record: ${path}.`);
    for (const [key, child] of Object.entries(shape))
      check((value as Record<string, unknown>)[key], child, `${path}.${key}`);
  }
}

function validateSave(value: unknown): asserts value is WorldSave {
  check(value, {
    format: "string", version: "number", simulationVersion: "string",
    savedAt: "string", readEventIds: ["string"], world: worldShape,
  }, "save");
  const save = value as WorldSave;
  if (save.format !== "headliner-world") throw new Error("This is not a Headliner save.");
  if (save.version !== SAVE_VERSION || save.simulationVersion !== SIMULATION_VERSION)
    throw new Error("This save uses an unsupported save or simulation version.");
  if (!Number.isFinite(Date.parse(save.savedAt))) throw new Error("Invalid save date.");
  const world = save.world;
  check(world.arrestCases, [arrestShape], "save.world.arrestCases");
  for (const member of world.members) {
    check(member, fields("riskTaking stress pastIncidents", "number"), "member.conduct");
    if (member.riskTaking < 1 || member.riskTaking > 20 || member.stress < 0 || member.stress > 100 ||
        !Number.isInteger(member.pastIncidents) || member.pastIncidents < 0)
      throw new Error("Invalid member conduct values.");
  }
  if (world.playerFestival !== null) check(world.playerFestival, playerShape, "save.world.playerFestival");
  if (!Number.isSafeInteger(world.seed) || world.seed < 0 ||
      !Number.isInteger(world.rngState) || world.rngState < 0 || world.rngState > 0xffffffff ||
      !Number.isSafeInteger(world.week) || world.week < 0 ||
      world.year !== Math.ceil(world.week / 52))
    throw new Error("Invalid simulation clock or random state.");
  const allIds = new Set<string>();
  for (const collection of [world.bands, world.members, world.agents, world.labels,
    world.festivals, world.sponsors, world.venues, world.staff]) {
    for (const item of collection) {
      if (!item.id || allIds.has(item.id)) throw new Error("Duplicate or missing entity ID.");
      allIds.add(item.id);
    }
  }
  const requireIds = (ids: string[], available: Set<string>) => {
    if (ids.some(id => !available.has(id))) throw new Error("Save references a missing entity.");
  };
  const bands = new Set(world.bands.map(band => band.id));
  const members = new Set(world.members.map(member => member.id));
  const labels = new Set(world.labels.map(label => label.id));
  const agents = new Set(world.agents.map(agent => agent.id));
  const arcs = new Set(world.storyArcs.map(arc => arc.id));
  if (world.playerFestival) {
    if (world.playerFestival.id !== "player_festival" || allIds.has(world.playerFestival.id))
      throw new Error("Invalid player festival ID.");
    allIds.add(world.playerFestival.id);
  }
  const caseIds = new Set<string>();
  for (const incident of world.arrestCases) {
    requireIds([incident.memberId], members);
    requireIds([incident.bandId], bands);
    if (!incident.id || caseIds.has(incident.id) ||
        !["detained", "on_bail", "cleared", "fined"].includes(incident.status) ||
        !Number.isInteger(incident.startedWeek) || incident.startedWeek < 0 || incident.startedWeek > world.week ||
        !Number.isInteger(incident.nextHearingWeek) || incident.nextHearingWeek <= incident.startedWeek ||
        ![0, 1].includes(incident.stage) ||
        incident.active !== ["detained", "on_bail"].includes(incident.status) ||
        world.members.find(member => member.id === incident.memberId)?.bandId !== incident.bandId)
      throw new Error("Invalid arrest history.");
    caseIds.add(incident.id);
  }
  const detained = world.arrestCases.filter(incident => incident.active);
  if (new Set(detained.map(incident => incident.memberId)).size !== detained.length)
    throw new Error("A member has multiple open cases.");
  const player = world.playerFestival;
  if (player) {
    requireIds([player.venueId], new Set(world.venues.map(venue => venue.id)));
    if (!["planning", "completed"].includes(player.status) || !["standard", "backstage_crisis"].includes(player.scenario) ||
        !player.name.trim() || player.name.length > 60 ||
        !Number.isInteger(player.eventWeek) || player.eventWeek < 1 ||
        player.capacity < 1 || player.ticketPrice <= 0 || player.cash < 0 || player.startingCash <= 0 ||
        player.operatingCost < 0 || player.reputation < 0 || player.reputation > 100)
      throw new Error("Invalid player festival.");
    const bookingIds = new Set<string>();
    for (const booking of player.bookings) {
      requireIds([booking.bandId], bands);
      if (!booking.id || bookingIds.has(booking.id) || !Number.isInteger(booking.fee) || booking.fee < 0 ||
          !["booked", "cancelled", "performed", "missed"].includes(booking.status))
        throw new Error("Invalid festival booking.");
      bookingIds.add(booking.id);
    }
    const live = player.bookings.filter(booking => booking.status !== "cancelled");
    if (live.length > 3 || new Set(live.map(booking => booking.bandId)).size !== live.length)
      throw new Error("Invalid festival lineup.");
    const decisions = new Set<string>();
    for (const decision of player.decisions) {
      requireIds([decision.caseId], caseIds);
      requireIds([decision.bookingId], bookingIds);
      const key = `${decision.caseId}/${decision.bookingId}`;
      if (!["keep", "cancel", "replace"].includes(decision.choice) || decisions.has(key) ||
          !Number.isInteger(decision.week) || decision.week < 0 || decision.week > world.week ||
          player.bookings.find(booking => booking.id === decision.bookingId)?.bandId !==
            world.arrestCases.find(incident => incident.id === decision.caseId)?.bandId)
        throw new Error("Invalid festival decision.");
      decisions.add(key);
    }
    requireIds(Object.keys(player.bandTrust), bands);
    for (const trust of Object.values(player.bandTrust)) {
      check(trust, "number", "bandTrust");
      if (trust < 0 || trust > 100) throw new Error("Invalid band trust.");
    }
    const venue = world.venues.find(item => item.id === player.venueId)!;
    if (player.capacity > venue.capacity) throw new Error("Festival capacity exceeds venue capacity.");
    const costs = venue.rentalCost + player.operatingCost +
      player.bookings.reduce((total, booking) => total + (booking.status === "cancelled" ? Math.ceil(booking.fee / 2) : booking.fee), 0);
    if (player.status === "completed") {
      check(player.result, resultShape, "festival.result");
      const result = player.result!;
      requireIds([...result.performedBandIds, ...result.missedBandIds], bands);
      if (result.attendance < 0 || result.attendance > player.capacity ||
          result.revenue !== result.attendance * player.ticketPrice ||
          result.costs !== costs || result.profit !== result.revenue - costs ||
          player.eventWeek > world.week || live.some(booking => booking.status === "booked") ||
          JSON.stringify(result.performedBandIds) !== JSON.stringify(live.filter(booking => booking.status === "performed").map(booking => booking.bandId)) ||
          JSON.stringify(result.missedBandIds) !== JSON.stringify(live.filter(booking => booking.status === "missed").map(booking => booking.bandId)))
        throw new Error("Invalid festival result.");
    } else if (player.result !== null || player.eventWeek <= world.week || live.some(booking => booking.status !== "booked")) {
      throw new Error("Invalid festival planning state.");
    }
    if (player.cash !== player.startingCash - costs + (player.result?.revenue ?? 0))
      throw new Error("Festival cash does not match its ledger.");
  }
  const statuses = ["active", "hiatus", "split", "closed", "left"];
  for (const item of [...world.bands, ...world.members, ...world.labels, ...world.festivals, ...world.staff])
    if (!statuses.includes(item.status)) throw new Error("Invalid entity status.");
  for (const band of world.bands) {
    requireIds(band.memberIds, members);
    requireIds([band.labelId], labels);
    requireIds([band.agentId], agents);
    requireIds(band.activeArcIds, arcs);
  }
  for (const member of world.members) {
    requireIds([member.bandId], bands);
    requireIds(Object.keys(member.relationships), members);
    for (const score of Object.values(member.relationships)) check(score, "number", "relationship");
  }
  for (const label of world.labels) requireIds(label.rosterIds, bands);
  for (const agent of world.agents) requireIds(agent.clientIds, bands);
  for (const festival of world.festivals) requireIds(festival.bookedBandIds, bands);
  for (const arc of world.storyArcs) {
    requireIds(arc.participantIds, allIds);
    if (!["band_conflict", "viral_breakout", "festival_crisis"].includes(arc.type))
      throw new Error("Unsupported storyline type.");
  }
  const events = new Set<string>();
  for (const event of world.events) {
    requireIds(event.entityIds, allIds);
    if (!event.id || events.has(event.id) || !Number.isInteger(event.week) ||
        event.week < 0 || event.week > world.week || event.year !== Math.ceil(event.week / 52))
      throw new Error("Invalid event history.");
    events.add(event.id);
  }
  if (arcs.size !== world.storyArcs.length) throw new Error("Duplicate storyline ID.");
  requireIds(save.readEventIds, events);
}

export function encodeSave(world: WorldState, readEventIds: string[] = []): string {
  const save: WorldSave = {
    format: "headliner-world", version: SAVE_VERSION,
    simulationVersion: SIMULATION_VERSION, savedAt: new Date().toISOString(),
    world, readEventIds,
  };
  validateSave(save);
  return JSON.stringify(save);
}

export function decodeSave(payload: string): WorldSave {
  let value: unknown;
  try { value = JSON.parse(payload); } catch { throw new Error("The save file is not valid JSON."); }
  const old = value as WorldSave | null;
  if (old?.format === "headliner-world" && old.version === 1 && old.simulationVersion === "0.0.3") {
    // Check the legacy structure before adding the new fields. Never consume RNG.
    check(old, { world: worldShape, readEventIds: ["string"], savedAt: "string" }, "legacySave");
    old.world.members = old.world.members.map(member => ({
      ...member, ...conductDefaults(member.id, member.professionalism),
    }));
    old.world.arrestCases = [];
    old.world.playerFestival = null;
    old.version = SAVE_VERSION;
    old.simulationVersion = SIMULATION_VERSION;
  }
  validateSave(value);
  return value;
}
