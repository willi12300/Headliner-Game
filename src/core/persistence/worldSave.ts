import type { WorldState } from "../domain/models";

export const SAVE_VERSION = 1;
export const SIMULATION_VERSION = "0.0.3";
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
  validateSave(value);
  return value;
}
