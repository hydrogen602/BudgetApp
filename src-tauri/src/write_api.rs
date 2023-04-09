use tauri::State;

use crate::{
    data::{Money, MyState},
    transfer_data::{CurrencyNotFoundError, UpdateBudgetJson},
};

#[tauri::command]
pub fn save_to_disk(path: String, state: State<MyState>) -> Result<(), Box<dyn std::error::Error>> {
    state.save(path)?;

    Ok(())
}

#[tauri::command]
pub fn load_from_disk(
    path: String,
    state: State<MyState>,
) -> Result<(), Box<dyn std::error::Error>> {
    state.load(path)?;

    Ok(())
}

#[tauri::command]
pub fn update_budget(
    update: UpdateBudgetJson,
    state: State<MyState>,
) -> Result<(), CurrencyNotFoundError> {
    let mut locked_state = state.0.lock().unwrap();
    match update {
        UpdateBudgetJson::Income(mj) => {
            let amount: Money = mj.try_into()?;
            locked_state.income = amount;
        }
        UpdateBudgetJson::Expense(name, mj) => {
            let amount: Money = mj.try_into()?;
            locked_state.expenses.insert(name, amount);
        }
    }

    Ok(())
}
