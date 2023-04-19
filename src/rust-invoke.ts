import { invoke } from "@tauri-apps/api";
import { IncomeAndExpensesJson } from "./rust-types/IncomeAndExpensesJson";

// export async function updateBudget(update: UpdateBudgetJson): Promise<void> {
//   return await invoke("update_budget", { update });
// }

export async function saveToDisk(path: String, data: IncomeAndExpensesJson): Promise<void> {
  return await invoke("save_to_disk", { path, data });
}

export async function loadFromDisk(path: String): Promise<IncomeAndExpensesJson> {
  return await invoke("load_from_disk", { path });
}
