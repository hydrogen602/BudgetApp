import { invoke } from "@tauri-apps/api";
import { UpdateBudgetJson } from "./rust-types/UpdateBudgetJson";

async function update_budget(update: UpdateBudgetJson): Promise<void> {
  return await invoke("update_budget", { update });
}
