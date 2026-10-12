import { invoke, isTauri } from "@tauri-apps/api/core";
import { decodeSave, encodeSave } from "./worldSave";
import type { WorldState } from "../domain/models";

export type SaveSlot = "manual" | "autosave";

// Browser previews use their own local storage; installed apps always use SQLite.
export async function saveWorld(slot: SaveSlot, world: WorldState, readIds: string[]): Promise<void> {
  const payload = encodeSave(world, readIds);
  if (isTauri()) await invoke("write_world_save", { slot, payload });
  else localStorage.setItem(`headliner.save.${slot}`, payload);
}

export async function loadWorld(slot: SaveSlot) {
  const payload = isTauri()
    ? await invoke<string | null>("read_world_save", { slot })
    : localStorage.getItem(`headliner.save.${slot}`);
  if (!payload) throw new Error(`No ${slot === "manual" ? "manual save" : "autosave"} exists yet.`);
  return decodeSave(payload);
}
