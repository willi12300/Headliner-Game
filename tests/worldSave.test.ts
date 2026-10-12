import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld } from "../src/core/generation/generateWorld";
import { simulateWeek, simulateToYear } from "../src/core/simulation/simulate";
import { decodeSave, encodeSave } from "../src/core/persistence/worldSave";
import { newsCategory, newsHeadline, storyHistory } from "../src/core/news/news";

test("a saved world preserves unfinished stories, history and read news", () => {
  const world = generateWorld(48291735);
  for (let i = 0; i < 100 && !world.storyArcs.some(arc => arc.active); i++) simulateWeek(world);
  assert.ok(world.events.length > 0);
  assert.ok(world.storyArcs.some(arc => arc.active));
  const readIds = [world.events[0].id];
  const restored = decodeSave(encodeSave(world, readIds));
  assert.equal(JSON.stringify(restored.world), JSON.stringify(world));
  assert.deepEqual(restored.readEventIds, readIds);
});

test("save/load between weekly ticks produces exactly the same future", () => {
  const uninterrupted = generateWorld(48291735);
  const beforeSave = generateWorld(48291735);
  for (let i = 0; i < 73; i++) simulateWeek(beforeSave);
  const restored = decodeSave(encodeSave(beforeSave)).world;
  simulateToYear(uninterrupted, 5);
  simulateToYear(restored, 5);
  assert.equal(JSON.stringify(restored), JSON.stringify(uninterrupted));
  assert.equal(JSON.stringify(decodeSave(encodeSave(restored)).world), JSON.stringify(uninterrupted));
});

test("fresh and long-running worlds round trip across different seeds", () => {
  for (const seed of [0, 1, 98765, 4294967295]) {
    const world = generateWorld(seed);
    assert.equal(JSON.stringify(decodeSave(encodeSave(world)).world), JSON.stringify(world));
    simulateToYear(world, 20);
    assert.equal(JSON.stringify(decodeSave(encodeSave(world)).world), JSON.stringify(world));
  }
});

test("unsupported, truncated and structurally corrupt saves are rejected", () => {
  const valid = JSON.parse(encodeSave(generateWorld(1)));
  assert.throws(() => decodeSave("{"), /JSON/);
  for (const corrupt of [
    { ...valid, version: 999 },
    { ...valid, simulationVersion: "future" },
    { ...valid, world: { ...valid.world, members: null } },
    { ...valid, world: { ...valid.world, rngState: -1 } },
    { ...valid, readEventIds: ["missing"] },
  ]) assert.throws(() => decodeSave(JSON.stringify(corrupt)));
  valid.world.bands[0].derived.overallQuality.components = null;
  assert.throws(() => decodeSave(JSON.stringify(valid)), /save list/);
});

test("invalid references cannot replace a playable world", () => {
  const world = generateWorld(1);
  world.bands[0].memberIds.push("missing-member");
  assert.throws(() => encodeSave(world), /missing entity/);
  world.bands[0].memberIds.pop();
  world.members[0].relationships[world.members[1].id] = Number.NaN;
  assert.throws(() => encodeSave(world), /relationship/);
});

test("news categories and developing story history come from simulation records", () => {
  const world = generateWorld(48291735);
  for (let i = 0; i < 100 && !world.storyArcs.some(arc => arc.active); i++) simulateWeek(world);
  for (const event of world.events) {
    assert.ok(newsHeadline(event).length);
    assert.ok(["people", "industry", "festivals"].includes(newsCategory(event)));
  }
  const arc = world.storyArcs.find(item => item.active)!;
  const history = storyHistory(world, arc.participantIds);
  assert.ok(history.length);
  assert.ok(history.every(event => event.entityIds.includes(arc.participantIds[0])));
});

test("a renewed dispute shows only the current storyline's history", () => {
  const world = generateWorld(1);
  const band = world.bands[0];
  const participants = [band.id, ...band.memberIds.slice(0, 2)];
  world.events = [
    { id: "old-start", week: 1, year: 1, type: "band_conflict_started", severity: 1, entityIds: participants, summary: "Old dispute" },
    { id: "old-end", week: 2, year: 1, type: "band_conflict_resolved", severity: 1, entityIds: participants, summary: "Made peace" },
    { id: "new-start", week: 20, year: 1, type: "band_conflict_started", severity: 1, entityIds: participants, summary: "New dispute" },
  ];
  assert.deepEqual(storyHistory(world, participants).map(event => event.id), ["new-start"]);
});
