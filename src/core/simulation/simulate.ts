import type { Band, BandMember, Festival, Snapshot, StoryArc, WorldState } from "../domain/models";
import { average, clamp, SeededRng } from "../rng/SeededRng";
import { recordEvent } from "./events";
import { conductDefaults, isDetained, processArrests } from "./arrests";
import { processPlayerFestival } from "./playerFestival";
import { applyBandDerivedValues, calculateBandValues } from "./derived";

const arcId = (state: WorldState): string => `arc_${state.week}_${state.storyArcs.length + 1}`;

function membersOf(state: WorldState, band: Band): BandMember[] {
  return band.memberIds
    .map((id) => state.members.find((member) => member.id === id))
    .filter((member): member is BandMember => Boolean(member));
}

function processMemberDevelopment(state: WorldState, rng: SeededRng): void {
  state.members.forEach((member) => {
    if (member.status !== "active" || isDetained(state, member.id)) return;

    if (member.weeksUnavailable > 0) {
      member.weeksUnavailable -= 1;
      member.fatigue = clamp(member.fatigue - rng.int(3, 8), 0, 100);
      member.health = clamp(member.health + rng.int(2, 6), 0, 100);
      if (member.weeksUnavailable === 0) {
        recordEvent(state, "member_recovered", 1, [member.id, member.bandId], `${member.name} returned to full availability.`);
      }
      return;
    }

    const band = state.bands.find((candidate) => candidate.id === member.bandId);
    if (!band || band.status !== "active") return;

    const room = Math.max(0, member.potentialAbility - member.currentAbility);
    const ageFactor = member.age < 24 ? 1.2 : member.age < 30 ? 0.8 : member.age < 34 ? 0.2 : -0.35;
    const personalityFactor = (member.professionalism + member.ambition + member.resilience) / 60;
    const fatiguePenalty = member.fatigue / 240;
    const development = room * 0.0014 * ageFactor * personalityFactor - fatiguePenalty + rng.float(-0.04, 0.07);
    member.currentAbility = clamp(member.currentAbility + development, 1, member.potentialAbility);

    member.fatigue = clamp(member.fatigue + rng.float(-2.5, 3.8), 0, 100);
    member.health = clamp(member.health + rng.float(-0.6, 0.35) - Math.max(0, member.fatigue - 70) * 0.018, 0, 100);
    member.morale = clamp(member.morale + rng.float(-1.1, 1.1) + band.momentum * 0.004 - band.fatigue * 0.008, 0, 100);

    const injuryChance = clamp(
      0.0007 +
        member.fatigue * 0.00009 +
        (100 - member.health) * 0.00008 +
        member.injurySusceptibility * 0.00017 +
        (member.traits.includes("Poor Lifestyle") ? 0.0035 : 0) +
        (member.traits.includes("Injury Prone") ? 0.005 : 0),
      0,
      0.12,
    );

    if (rng.chance(injuryChance)) {
      member.weeksUnavailable = rng.int(1, member.traits.includes("Injury Prone") ? 9 : 6);
      member.health = clamp(member.health - rng.int(5, 16), 0, 100);
      recordEvent(
        state,
        "member_injury",
        member.weeksUnavailable > 5 ? 3 : 2,
        [member.id, band.id],
        `${member.name} of ${band.name} was ruled out for ${member.weeksUnavailable} weeks.`,
      );
    }
  });
}

function recalculateBand(state: WorldState, band: Band): void {
  const members = membersOf(state, band).filter((member) => member.status === "active");
  if (members.length < 2) {
    if (band.status === "active") {
      band.status = "split";
      recordEvent(state, "band_split", 4, [band.id], `${band.name} split after falling below two active members.`);
    }
    return;
  }

  const available = members.filter((member) => member.weeksUnavailable === 0 && !isDetained(state, member.id));
  const performers = available.length > 0 ? available : members;
  const relationshipValues = members.flatMap((member) =>
    Object.entries(member.relationships)
      .filter(([otherId]) => band.memberIds.includes(otherId))
      .map(([, score]) => score),
  );

  band.chemistry = clamp(average(relationshipValues), 0, 100);
  band.morale = clamp(average(members.map((member) => member.morale)), 0, 100);
  band.fatigue = clamp(average(members.map((member) => member.fatigue)), 0, 100);
  band.professionalism = average(members.map((member) => member.professionalism));
  band.ambition = average(members.map((member) => member.ambition));
  band.loyalty = average(members.map((member) => member.loyalty));
  band.ego = average(members.map((member) => member.ego));
  band.resilience = average(members.map((member) => member.resilience));

  const availabilityPenalty = (members.length - available.length) * 4;
  const recalculated = calculateBandValues(band, performers, {
    careerExposure: clamp(band.popularity * 0.82 + band.reputation * 0.18, 0, 100),
    recentSuccess: clamp(band.momentum - availabilityPenalty, 0, 100),
    regionalReach: clamp(band.popularity * 0.72 + band.socialInfluence * 1.4, 0, 100),
    existingFollowers: band.followers,
    momentumInput: band.momentum,
  });
  applyBandDerivedValues(band, recalculated);
}

function processBandCareer(state: WorldState, rng: SeededRng): void {
  state.bands.forEach((band) => {
    if (band.status !== "active") return;
    recalculateBand(state, band);
    if (band.status !== "active") return;

    let followerGrowth = Math.max(0, Math.round((band.popularity * 3 + band.momentum * 4 + band.socialInfluence * 12) * rng.float(0.15, 1.05)));
    if (band.traits.includes("Fast-Growing Fanbase")) followerGrowth = Math.round(followerGrowth * 1.35);
    band.followers += followerGrowth;
    band.popularity = clamp(band.popularity + followerGrowth / 26000 + rng.float(-0.13, 0.24), 0, 100);
    band.momentum = clamp(band.momentum + rng.float(-2.2, 2.4), 0, 100);
    band.ticketDraw = Math.max(20, Math.round(Math.pow(band.festivalDraw / 100, 2.1) * 42_000));
    band.financialHealth = clamp(band.financialHealth + rng.float(-1.4, 1.8) + band.popularity * 0.006, 0, 100);

    const viralChance = clamp(
      0.0005 +
        band.currentAbility * 0.000018 +
        band.momentum * 0.000025 +
        band.socialInfluence * 0.00022 +
        band.viralPotential * 0.00022 +
        (band.traits.includes("Fast-Growing Fanbase") ? 0.004 : 0),
      0,
      0.07,
    );

    if (rng.chance(viralChance)) {
      const gain = rng.int(5000, 70000);
      band.followers += gain;
      band.popularity = clamp(band.popularity + rng.int(3, 9), 0, 100);
      band.momentum = clamp(band.momentum + rng.int(12, 27), 0, 100);
      recordEvent(state, "viral_moment", 3, [band.id], `${band.name} went viral and gained ${gain.toLocaleString()} followers.`);
    }
  });
}

function processRelationships(state: WorldState, rng: SeededRng): void {
  state.bands.forEach((band) => {
    if (band.status !== "active") return;
    const members = membersOf(state, band).filter((member) => member.status === "active");

    members.forEach((member) => {
      members.forEach((other) => {
        if (member.id === other.id) return;
        const drift = rng.float(-0.65, 0.55) + (band.morale - 50) * 0.004 - band.fatigue * 0.0025;
        member.relationships[other.id] = clamp((member.relationships[other.id] ?? 50) + drift, 0, 100);
      });
    });

    const alreadyInConflict = state.storyArcs.some(
      (arc) => arc.active && arc.type === "band_conflict" && arc.participantIds.includes(band.id),
    );

    const conflictChance = clamp(
      0.0007 +
        (100 - band.chemistry) * 0.0001 +
        band.fatigue * 0.00007 +
        Math.max(0, 50 - band.morale) * 0.0001 +
        band.ego * 0.00006 -
        band.professionalism * 0.000035 +
        (band.traits.includes("Creative Differences") ? 0.007 : 0) +
        (band.financialHealth < 25 ? 0.003 : 0),
      0,
      0.1,
    );

    if (!alreadyInConflict && members.length >= 2 && rng.chance(conflictChance)) {
      const sorted = [...members].sort((a, b) => b.ego - a.ego);
      const arc: StoryArc = {
        id: arcId(state),
        type: "band_conflict",
        participantIds: [band.id, sorted[0].id, sorted[1].id],
        stage: 0,
        severity: rng.int(1, 3),
        nextEvaluationWeek: state.week + rng.int(1, 3),
        active: true,
      };
      state.storyArcs.push(arc);
      band.activeArcIds.push(arc.id);
      recordEvent(state, "band_conflict_started", arc.severity, arc.participantIds, `Tension developed inside ${band.name}.`);
    }
  });
}

function recruitReplacement(state: WorldState, band: Band, rng: SeededRng): void {
  if (!rng.chance(0.7)) return;
  const existing = membersOf(state, band).filter((member) => member.status === "active");
  const source = existing[0];
  if (!source) return;

  const replacement: BandMember = {
    ...source,
    id: `replacement_${state.week}_${state.members.length + 1}`,
    name: `New Member ${state.members.length + 1}`,
    age: rng.int(18, 34),
    currentAbility: clamp(source.currentAbility + rng.float(-8, 8), 1, source.potentialAbility),
    potentialAbility: clamp(source.potentialAbility + rng.float(-6, 8), 1, 99),
    morale: rng.int(55, 82),
    fatigue: rng.int(0, 10),
    relationships: {},
    traits: [],
    status: "active",
    weeksUnavailable: 0,
  };

  existing.forEach((member) => {
    member.relationships[replacement.id] = rng.int(35, 70);
    replacement.relationships[member.id] = rng.int(35, 70);
  });
  Object.assign(replacement, conductDefaults(replacement.id, replacement.professionalism));
  state.members.push(replacement);
  band.memberIds.push(replacement.id);
  recordEvent(state, "member_joined", 2, [replacement.id, band.id], `${replacement.name} joined ${band.name}.`);
}

function processStoryArcs(state: WorldState, rng: SeededRng): void {
  state.storyArcs.forEach((arc) => {
    if (!arc.active || arc.nextEvaluationWeek > state.week) return;
    if (arc.type !== "band_conflict") return;

    const [bandId, firstId, secondId] = arc.participantIds;
    const band = state.bands.find((candidate) => candidate.id === bandId);
    const first = state.members.find((member) => member.id === firstId);
    const second = state.members.find((member) => member.id === secondId);
    if (!band || !first || !second || band.status !== "active") {
      arc.active = false;
      return;
    }

    if (arc.stage === 0) {
      band.chemistry = clamp(band.chemistry - rng.int(4, 11), 0, 100);
      first.morale = clamp(first.morale - rng.int(4, 10), 0, 100);
      second.morale = clamp(second.morale - rng.int(4, 10), 0, 100);
      arc.stage = 1;
      arc.nextEvaluationWeek = state.week + rng.int(2, 4);
      recordEvent(state, "band_conflict_escalated", arc.severity, arc.participantIds, `The dispute inside ${band.name} worsened.`);
      return;
    }

    const reconcile = band.resilience + band.professionalism + band.chemistry * 0.15 + rng.int(0, 20);
    const departure = band.ego + (100 - band.chemistry) * 0.18 + Math.max(0, 50 - band.morale) * 0.14 + rng.int(0, 20);

    if (reconcile > departure + 8) {
      band.chemistry = clamp(band.chemistry + rng.int(5, 13), 0, 100);
      arc.active = false;
      recordEvent(state, "band_conflict_resolved", 1, arc.participantIds, `${band.name} resolved an internal dispute.`);
      return;
    }

    if (departure > reconcile + 6) {
      const leaving = first.ego + first.ambition >= second.ego + second.ambition ? first : second;
      leaving.status = "left";
      band.memberIds = band.memberIds.filter((id) => id !== leaving.id);
      band.momentum = clamp(band.momentum - rng.int(4, 12), 0, 100);
      arc.active = false;
      recordEvent(state, "member_departure", 3, [leaving.id, band.id], `${leaving.name} left ${band.name} after an internal dispute.`);
      recruitReplacement(state, band, rng);
      recalculateBand(state, band);
      return;
    }

    arc.severity = clamp(arc.severity + 1, 1, 5);
    arc.nextEvaluationWeek = state.week + rng.int(2, 5);
  });
}

function scoreBandForFestival(band: Band, festival: Festival): number {
  const genreFit = band.genre === festival.genreFocus ? 24 : 5;
  const draw = band.popularity * 0.33;
  const momentum = band.momentum * 0.22;
  const live = band.liveAbility * 0.18;
  const discovery = band.isWonderband ? festival.discoveryReputation * 0.08 : 0;
  const cost = (band.currentAbility * 1600 + band.popularity * 900) / Math.max(festival.cashReserves, 1) * 40;
  const risk = band.traits.includes("Frequently Late") ? 7 : 0;
  return genreFit + draw + momentum + live + discovery - cost - risk;
}

function processFestivals(state: WorldState, rng: SeededRng): void {
  state.festivals.forEach((festival) => {
    if (festival.status !== "active") return;

    const candidates = state.bands
      .filter((band) => band.status === "active" && !festival.bookedBandIds.includes(band.id))
      .map((band) => ({ band, score: scoreBandForFestival(band, festival) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (candidates.length > 0 && rng.chance(clamp(0.05 + festival.aggression * 0.008, 0.04, 0.24))) {
      const target = candidates[rng.int(0, Math.min(2, candidates.length - 1))].band;
      const fee = Math.round(target.currentAbility * 1500 + target.popularity * 850 + target.momentum * 240);
      if (festival.cashReserves > fee) {
        festival.cashReserves -= fee;
        festival.bookedBandIds.push(target.id);
        target.financialHealth = clamp(target.financialHealth + 2, 0, 100);
        target.momentum = clamp(target.momentum + rng.int(1, 5), 0, 100);
        recordEvent(state, "festival_booking", 2, [festival.id, target.id], `${festival.name} booked ${target.name}.`);
      }
    }

    const lineupBands = festival.bookedBandIds
      .map((id) => state.bands.find((band) => band.id === id))
      .filter((band): band is Band => Boolean(band));
    const lineupAppeal = average(lineupBands.map((band) => band.popularity + band.liveAbility * 0.35));
    const demandRatio = clamp(0.3 + festival.reputation / 150 + lineupAppeal / 220 + rng.float(-0.08, 0.08), 0.15, 1.15);
    festival.attendance = Math.round(Math.min(festival.capacity, festival.capacity * demandRatio));

    const revenue = festival.attendance * (45 + festival.reputation * 0.9);
    const operatingCost = festival.capacity * (18 + festival.productionQuality * 1.2) + festival.bookedBandIds.length * 9000;
    const profit = revenue - operatingCost;
    festival.cashReserves += profit / 52;
    festival.reputation = clamp(festival.reputation + (festival.attendance / festival.capacity - 0.65) * 0.08 + rng.float(-0.05, 0.06), 0, 100);
    festival.followers = Math.max(0, Math.round(festival.followers + festival.reputation * rng.float(1, 8)));

    if (festival.cashReserves < -150000 || festival.debt > 1000000) {
      festival.status = "closed";
      recordEvent(state, "festival_closed", 5, [festival.id], `${festival.name} ceased trading after a financial collapse.`);
    } else if (state.week > 0 && state.week % 52 === 0 && profit > 100000 && festival.expansionAmbition > 12) {
      const growth = Math.round(festival.capacity * rng.float(0.04, 0.16) / 500) * 500;
      festival.capacity += growth;
      recordEvent(state, "festival_expanded", 2, [festival.id], `${festival.name} expanded by ${growth.toLocaleString()} capacity.`);
    }
  });
}

function processLabels(state: WorldState, rng: SeededRng): void {
  state.labels.forEach((label) => {
    if (label.status !== "active") return;
    const roster = label.rosterIds
      .map((id) => state.bands.find((band) => band.id === id))
      .filter((band): band is Band => Boolean(band));
    const revenue = roster.reduce((sum, band) => sum + band.popularity * 3500 + band.followers * 0.04, 0);
    const investment = roster.length * label.developmentQuality * 1100;
    label.cashReserves += (revenue - investment) / 52 + rng.float(-10000, 10000);
    label.debt = Math.max(0, label.debt + (label.cashReserves < 0 ? Math.abs(label.cashReserves) * 0.03 : -500));
    if (label.cashReserves < -300000 || label.debt > 1500000) {
      label.status = "closed";
      recordEvent(state, "label_closed", 5, [label.id], `${label.name} collapsed financially.`);
    }
  });
}

function takeSnapshot(state: WorldState): Snapshot {
  const activeBands = state.bands.filter((band) => band.status === "active");
  const activeFestivals = state.festivals.filter((festival) => festival.status === "active");
  return {
    year: state.year,
    activeBands: activeBands.length,
    splitBands: state.bands.filter((band) => band.status === "split").length,
    activeFestivals: activeFestivals.length,
    closedFestivals: state.festivals.filter((festival) => festival.status === "closed").length,
    totalFollowers: activeBands.reduce((sum, band) => sum + band.followers, 0),
    averageBandPopularity: average(activeBands.map((band) => band.popularity)),
    averageFestivalReputation: average(activeFestivals.map((festival) => festival.reputation)),
    viralMoments: state.events.filter((event) => event.type === "viral_moment").length,
    memberDepartures: state.events.filter((event) => event.type === "member_departure").length,
    injuries: state.events.filter((event) => event.type === "member_injury").length,
    topBands: [...activeBands]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5)
      .map((band) => ({ name: band.name, popularity: band.popularity, followers: band.followers })),
    topFestivals: [...activeFestivals]
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 4)
      .map((festival) => ({ name: festival.name, reputation: festival.reputation, capacity: festival.capacity })),
  };
}

export function simulateWeek(state: WorldState): WorldState {
  const rng = new SeededRng(state.rngState);
  state.week += 1;
  state.year = Math.floor((state.week - 1) / 52) + 1;

  processArrests(state, rng);
  processMemberDevelopment(state, rng);
  processBandCareer(state, rng);
  processRelationships(state, rng);
  processStoryArcs(state, rng);
  processFestivals(state, rng);
  processLabels(state, rng);

  state.bands.forEach((band) => {
    if (band.status === "active") recalculateBand(state, band);
  });

  processPlayerFestival(state, rng);

  if (state.week % 52 === 0) {
    state.members.forEach((member) => {
      if (member.status === "active") member.age += 1;
    });
    state.snapshots.push(takeSnapshot(state));
  }

  state.rngState = rng.getState();
  return state;
}

export function simulateToYear(state: WorldState, targetYear: number): WorldState {
  const targetWeek = targetYear * 52;
  while (state.week < targetWeek) simulateWeek(state);
  return state;
}

export function snapshotNow(state: WorldState): Snapshot {
  return takeSnapshot(state);
}
