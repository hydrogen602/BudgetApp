import { invoke } from "@tauri-apps/api";
import { UpdateBudgetJson } from "./rust-types/UpdateBudgetJson";

export async function updateBudget(update: UpdateBudgetJson): Promise<void> {
  return await invoke("update_budget", { update });
}

export async function saveToDisk(path: String): Promise<void> {
  return await invoke("save_to_disk", { path });
}

export async function loadToDisk(path: String): Promise<void> {
  return await invoke("load_from_disk", { path });
}