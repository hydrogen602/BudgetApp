import { invoke } from "@tauri-apps/api";
import { IncomeAndExpensesJson } from "./rust-types/IncomeAndExpensesJson";
import { IStandardRecords } from "./pages/Records";
import { TransactionJson } from "./rust-types/TransactionJson";

// export async function updateBudget(update: UpdateBudgetJson): Promise<void> {
//   return await invoke("update_budget", { update });
// }

export async function saveToDisk(path: String, data: IncomeAndExpensesJson): Promise<void> {
  return await invoke("save_to_disk", { path, data });
}

export async function loadFromDisk(path: String): Promise<IncomeAndExpensesJson> {
  return await invoke("load_from_disk", { path });
}

export async function saveNewTransactions(data: IStandardRecords) {
  // date: String, description: String, amount: MoneyJson, category: String
  return await invoke("save_new_transactions", { data: data.map(record => [record.Date, record.Description, record.Amount, record.Category]) });
}
