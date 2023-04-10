import { invoke } from "@tauri-apps/api";
import { UpdateBudgetJson } from "./rust-types/UpdateBudgetJson";

async function updateBudget(update: UpdateBudgetJson): Promise<void> {
  return await invoke("update_budget", { update });
}

async function saveToDisk(path: String) {
  return await invoke("save_to_disk", { path });
}

async function loadToDisk(path: String) {
  return await invoke("load_from_disk", { path });
}