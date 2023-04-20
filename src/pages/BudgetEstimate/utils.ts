import { FixedExpense, PercentExpense } from "../../data";
// import { Dinero } from "dinero.js";
// import DineroBuilder from "dinero.js";
import { IncomeAndExpensesJson } from "../../rust-types/IncomeAndExpensesJson";
import { ExpensesJson } from "../../rust-types/ExpensesJson";
import { IIncomeExpenseState } from "./stateReducer";
import { useState } from "react";


export interface IExpenses {
  [key: string]: FixedExpense | PercentExpense;
}


export function getAllState(state: IIncomeExpenseState): IncomeAndExpensesJson {
  const transformedExpenses: ExpensesJson[] = [];
  for (let [k, v] of Object.entries(state.expenses)) {
    if (v instanceof FixedExpense) {
      transformedExpenses.push({
        Expense: [k, v.amount],
      });
    }
    else if (v instanceof PercentExpense) {
      transformedExpenses.push({
        ExpensePercentage: [k, v.percentage],
      });
    }
  }

  return {
    income: [state.income],
    expenses: transformedExpenses,
  };
}


export function useResetKey() {
  const [resetKey, setResetKey] = useState(0);
  return [resetKey, () => setResetKey(resetKey => (resetKey + 1) % 1000)] as const;
}