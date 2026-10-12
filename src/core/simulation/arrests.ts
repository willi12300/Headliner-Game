import type { BandMember, WorldState } from "../domain/models";
import { clamp, SeededRng } from "../rng/SeededRng";
import { recordEvent } from "./events";

// Stable personality defaults also let old saves migrate without consuming RNG.
export function conductDefaults(id: string, professionalism: number) {
  let hash = 2166136261;
  for (const letter of id) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619) >>> 0;
  return { riskTaking: 1 + hash % 20, stress: clamp(35 - professionalism, 5, 35), pastIncidents: 0 };
}

export function isDetained(world: WorldState, memberId: string): boolean {
  return world.arrestCases.some(item => item.memberId === memberId && item.status === "detained");
}

export function arrestChance(member: BandMember): number {
  return clamp(
    0.00003 + member.riskTaking * 0.000008 + member.stress * 0.000004 +
    member.pastIncidents * 0.000025 - member.professionalism * 0.000008 +
    (member.traits.includes("Poor Lifestyle") ? 0.0002 : 0), 0.00001, 0.002,
  );
}

export function startArrest(world: WorldState, memberId: string): void {
  const member = world.members.find(item => item.id === memberId);
  const band = world.bands.find(item => item.id === member?.bandId);
  if (!member || !band || member.status !== "active" || band.status !== "active" ||
      world.arrestCases.some(item => item.memberId === memberId && item.active)) return;
  world.arrestCases.push({
    id: `arrest_${world.week}_${world.arrestCases.length + 1}`,
    memberId, bandId: band.id, startedWeek: world.week, nextHearingWeek: world.week + 2,
    stage: 0, status: "detained", active: true,
  });
  member.pastIncidents += 1;
  member.stress = clamp(member.stress + 20, 0, 100);
  member.morale = clamp(member.morale - 10, 0, 100);
  band.momentum = clamp(band.momentum - 6, 0, 100);
  // Allegations are reported as allegations; later news records the actual outcome.
  recordEvent(world, "member_arrested", 4, [band.id, member.id],
    `${member.name} of ${band.name} was arrested on suspicion of public disorder. They are detained pending a hearing; the allegation has not been proven.`);
  for (const other of world.members.filter(item => band.memberIds.includes(item.id) && item.id !== member.id)) {
    other.relationships[member.id] = clamp((other.relationships[member.id] ?? 50) - 5, 0, 100);
    member.relationships[other.id] = clamp((member.relationships[other.id] ?? 50) - 2, 0, 100);
  }
}

export function processArrests(world: WorldState, rng: SeededRng): void {
  for (const incident of world.arrestCases) {
    if (!incident.active || incident.nextHearingWeek > world.week) continue;
    const member = world.members.find(item => item.id === incident.memberId)!;
    const band = world.bands.find(item => item.id === incident.bandId)!;
    if (incident.stage === 0) {
      const released = rng.chance(clamp(0.55 + member.professionalism * 0.015 - member.pastIncidents * 0.04, 0.2, 0.9));
      incident.status = released ? "on_bail" : "detained";
      incident.stage = 1;
      incident.nextHearingWeek = world.week + 2;
      recordEvent(world, released ? "member_bailed" : "member_remanded", 3, [band.id, member.id],
        released
          ? `${member.name} was released on bail and can perform if otherwise fit. The case is still open; no verdict has been reached.`
          : `${member.name} remains detained until a further hearing in week ${incident.nextHearingWeek}. Their appearances remain at risk.`);
    } else {
      const fined = rng.chance(clamp(0.25 + member.riskTaking * 0.012 + member.pastIncidents * 0.025, 0.1, 0.8));
      incident.status = fined ? "fined" : "cleared";
      incident.active = false;
      member.stress = clamp(member.stress - 15, 0, 100);
      band.financialHealth = clamp(band.financialHealth - (fined ? 6 : 0), 0, 100);
      recordEvent(world, fined ? "member_fined" : "member_cleared", fined ? 3 : 2, [band.id, member.id],
        fined ? `${member.name} was found guilty of public disorder and fined. They are now free to perform, but the case has strained ${band.name}'s finances and relationships.`
          : `${member.name}'s case was dismissed. They are free to perform; the disruption remains part of ${band.name}'s history.`);
    }
  }
  for (const member of world.members) {
    if (member.status !== "active") continue;
    member.stress = clamp(member.stress + (member.fatigue - 40) * 0.015 + (50 - member.morale) * 0.02 - member.resilience * 0.01, 0, 100);
    if (world.arrestCases.some(item => item.memberId === member.id && item.active)) continue;
    if (rng.chance(arrestChance(member))) startArrest(world, member.id);
  }
  const festival = world.playerFestival;
  // A labelled challenge guarantees one incident so players can try the decisions.
  if (festival?.status === "planning" && festival.scenario === "backstage_crisis" &&
      !festival.scenarioTriggered && world.week >= festival.eventWeek - 2) {
    festival.scenarioTriggered = true;
    const headline = festival.bookings.filter(item => item.status === "booked")
      .map(item => world.bands.find(band => band.id === item.bandId)!)
      .filter(band => band.status === "active")
      .sort((a, b) => b.popularity - a.popularity)[0];
    const member = world.members.filter(item => headline?.memberIds.includes(item.id) && item.status === "active" &&
      !world.arrestCases.some(incident => incident.memberId === item.id && incident.active))
      .sort((a, b) => Number(b.role === "Lead Vocalist") - Number(a.role === "Lead Vocalist"))[0];
    if (member) startArrest(world, member.id);
  }
}
