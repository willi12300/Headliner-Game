import type { SimulationEvent, WorldState } from "../domain/models";

export type NewsCategory = "people" | "industry" | "festivals";
export function newsCategory(event: SimulationEvent): NewsCategory {
  if (event.type.startsWith("festival_")) return "festivals";
  if (event.type.startsWith("member_") || event.type.startsWith("band_")) return "people";
  return "industry";
}

export function newsHeadline(event: SimulationEvent): string {
  const titles: Record<string, string> = {
    member_arrested: "A musician's arrest puts appearances at risk",
    member_bailed: "Released on bail",
    member_remanded: "Further detention confirmed",
    member_fined: "Court verdict: a fine",
    member_cleared: "Case dismissed",
    festival_founded: "A new festival enters the scene",
    festival_player_booking: "Your lineup takes shape",
    festival_booking_cancelled: "An appearance is cancelled",
    festival_booking_kept: "Festival stands by its act",
    festival_act_replaced: "Replacement act confirmed",
    festival_player_result: "The festival's first chapter",
    member_injury: "Injury sidelines musician",
    member_recovered: "Back in action",
    viral_moment: "A breakout moment",
    band_conflict_started: "Trouble behind the scenes",
    band_conflict_escalated: "Band tensions deepen",
    band_conflict_resolved: "A band makes peace",
    member_departure: "A change in the lineup",
    member_joined: "A new chapter begins",
    band_split: "The end of an era",
    festival_booking: "Festival announces a booking",
    festival_closed: "Festival shuts its doors",
    festival_expanded: "Festival prepares to grow",
    label_closed: "Record label closes",
  };
  return titles[event.type] ?? event.type.split("_").join(" ");
}

export function storyHistory(world: WorldState, participantIds: string[]): SimulationEvent[] {
  const matching = world.events.filter(event =>
    event.type.startsWith("band_conflict_") &&
    participantIds.every(id => event.entityIds.includes(id)));
  // The same people can fall out again years later. Keep this dispute's history.
  let start = 0;
  matching.forEach((event, index) => {
    if (event.type === "band_conflict_started") start = index;
  });
  return matching.slice(Math.max(0, start));
}
