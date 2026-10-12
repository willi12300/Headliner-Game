import type { WorldState } from "../domain/models";

export function recordEvent(
  state: WorldState, type: string, severity: number, entityIds: string[], summary: string,
): void {
  state.events.push({
    id: `${type}_${state.week}_${state.events.length + 1}`,
    week: state.week, year: state.year, type, severity, entityIds, summary,
  });
}
