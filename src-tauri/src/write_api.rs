use tauri::State;

use crate::{
    data::{Money, MyState},
    transfer_data::{CurrencyNotFoundError, UpdateBudgetJson},
};

// TODO: refactor this: either do all state in js or all state in rust, not this weird mix

#[tauri::command]
pub fn save_to_disk(path: String, state: State<MyState>) -> Result<(), String> {
    state.save(path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load_from_disk(path: String, state: State<MyState>) -> Result<(), String> {
    state.load(path).map_err(|e| e.to_string())?;

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
            locked_state
                .expenses
                .insert(name, either::Either::Left(amount));
        }
        UpdateBudgetJson::ExpensePercentage(name, percentage) => {
            locked_state
                .expenses
                .insert(name, either::Either::Right(percentage));
        }
    }

    Ok(())
}
