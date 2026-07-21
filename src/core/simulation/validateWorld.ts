import type { WorldState } from "../domain/models";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  entityType: string;
  entityId?: string;
  entityName?: string;
  rule: string;
  message: string;
}

export function validateWorld(world: WorldState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const memberIds = new Set(world.members.map((member) => member.id));
  const bandIds = new Set(world.bands.map((band) => band.id));
  const labelIds = new Set(world.labels.map((label) => label.id));
  const agentIds = new Set(world.agents.map((agent) => agent.id));

  for (const band of world.bands) {
    if (band.memberIds.length === 0) {
      issues.push({ id: `band-members-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "band_has_members", message: "Band has no members." });
    }
    for (const memberId of band.memberIds) {
      if (!memberIds.has(memberId)) issues.push({ id: `missing-member-${band.id}-${memberId}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "member_reference_exists", message: `References missing member ${memberId}.` });
    }
    if (!labelIds.has(band.labelId)) issues.push({ id: `missing-label-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "label_reference_exists", message: "Band references a missing label." });
    if (!agentIds.has(band.agentId)) issues.push({ id: `missing-agent-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "agent_reference_exists", message: "Band references a missing agent." });
    if (band.followers < 0) issues.push({ id: `followers-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "followers_non_negative", message: "Band has negative followers." });
    if (band.overallQuality > band.growthCeiling) issues.push({ id: `ability-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "quality_not_above_ceiling", message: "Overall quality exceeds growth ceiling." });
    if (band.popularity > 80 && band.overallQuality < 25 && band.commercialAppeal < 75) issues.push({ id: `coherence-pop-${band.id}`, severity: "warning", entityType: "band", entityId: band.id, entityName: band.name, rule: "popularity_has_supporting_causes", message: "Very high popularity has neither sufficient quality nor exceptional commercial appeal." });
    if (band.followers > 1_000_000 && band.popularity < 45) issues.push({ id: `coherence-followers-${band.id}`, severity: "warning", entityType: "band", entityId: band.id, entityName: band.name, rule: "followers_match_popularity", message: "Follower count is unusually high for the band's popularity." });
    if (band.ticketDraw > 25_000 && band.livePerformance < 35 && band.fanLoyalty < 45) issues.push({ id: `coherence-draw-${band.id}`, severity: "warning", entityType: "band", entityId: band.id, entityName: band.name, rule: "draw_has_supporting_causes", message: "Festival draw is high without live strength or fan loyalty." });
    if (Math.abs(band.overallQuality - band.derived.overallQuality.value) > 0.11) issues.push({ id: `derived-sync-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "derived_value_is_source_of_truth", message: "Stored overall quality has drifted from its calculation output." });
    if (band.bookingFee < 0) issues.push({ id: `fee-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: "booking_fee_non_negative", message: "Booking fee is negative." });
    for (const [field, value] of Object.entries({ popularity: band.popularity, momentum: band.momentum, chemistry: band.chemistry, morale: band.morale })) {
      if (value < 0 || value > 100) issues.push({ id: `${field}-${band.id}`, severity: "error", entityType: "band", entityId: band.id, entityName: band.name, rule: `${field}_range`, message: `${field} is outside 0–100.` });
    }
  }

  for (const member of world.members) {
    if (!bandIds.has(member.bandId)) issues.push({ id: `member-band-${member.id}`, severity: "error", entityType: "member", entityId: member.id, entityName: member.name, rule: "band_reference_exists", message: "Member references a missing band." });
    if (member.age < 16 || member.age > 90) issues.push({ id: `member-age-${member.id}`, severity: "warning", entityType: "member", entityId: member.id, entityName: member.name, rule: "plausible_age", message: `Age ${member.age} is outside the expected range.` });
    if (member.currentAbility > member.potentialAbility) issues.push({ id: `member-potential-${member.id}`, severity: "warning", entityType: "member", entityId: member.id, entityName: member.name, rule: "ability_not_above_potential", message: "Current ability exceeds potential ability." });
  }

  for (const festival of world.festivals) {
    if (festival.attendance > festival.capacity) issues.push({ id: `festival-capacity-${festival.id}`, severity: "error", entityType: "festival", entityId: festival.id, entityName: festival.name, rule: "attendance_within_capacity", message: "Attendance exceeds licensed capacity." });
    if (festival.cashReserves - festival.debt < -1_000_000) issues.push({ id: `festival-solvency-${festival.id}`, severity: "warning", entityType: "festival", entityId: festival.id, entityName: festival.name, rule: "solvency", message: "Festival is deeply insolvent." });
  }

  for (const event of world.events) {
    for (const entityId of event.entityIds) {
      const exists = bandIds.has(entityId) || memberIds.has(entityId) || world.festivals.some((festival) => festival.id === entityId);
      if (!exists) issues.push({ id: `event-ref-${event.id}-${entityId}`, severity: "warning", entityType: "event", entityId: event.id, entityName: event.type, rule: "event_entity_exists", message: `Event references unknown entity ${entityId}.` });
    }
  }

  if (issues.length === 0) issues.push({ id: "world-valid", severity: "info", entityType: "world", rule: "world_health", message: "No structural validation problems detected." });
  return issues;
}
