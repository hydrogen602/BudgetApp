import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";
import { IExpenses } from "./utils";
import { useMemo, useReducer } from "react";
import { FixedExpense, PercentExpense } from "../../data";
import { IncomeAndExpensesJson } from "../../rust-types/IncomeAndExpensesJson";


export interface IIncomeExpenseState {
  income: Dinero;
  expenses: IExpenses;
};

type IIncomeExpenseAction = {
  type: 'income'
  income: Dinero;
} | {
  type: 'removeExpense',
  expenseName: string;
} | {
  type: 'setExpense',
  expenseName: string
  value: FixedExpense | PercentExpense;
} | {
  type: 'setAll',
  state: IIncomeExpenseState,
};

function incomeExpenseReducer(state: IIncomeExpenseState, action: IIncomeExpenseAction): IIncomeExpenseState {
  switch (action.type) {
    case 'income':
      return {
        ...state,
        income: action.income,
      };
    case 'removeExpense':
      const newExpenses = { ...state.expenses };
      delete newExpenses[action.expenseName];
      return {
        ...state,
        expenses: newExpenses,
      };
    case 'setExpense':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.expenseName]: action.value,
        },
      };
    case 'setAll':
      return action.state;
    default:
      throw new Error('Invalid action');
  }
}

export interface IModifiers {
  setIncome: (income: Dinero) => void;
  removeExpense: (expenseName: string) => void;
  setExpense: (expenseName: string, value: FixedExpense | PercentExpense) => void;
  // setAll: (state: IIncomeExpenseState) => void;
  setFromJson: (data: IncomeAndExpensesJson) => void;
}

export interface IComputed {
  netIncome: Dinero,
  expenseNameList: string[],
}


export default function useIncomeExpenseReducer(): [IIncomeExpenseState, IModifiers, IComputed] {
  const [state, dispatch] = useReducer(incomeExpenseReducer, {
    income: DineroBuilder({ amount: 0, currency: 'USD' }),
    expenses: {
      'Savings': new PercentExpense(0),
      'Donations': new PercentExpense(0),
      'Monthly Rent': new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })),
      'Monthly Groceries': new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })),
    },
  } as IIncomeExpenseState);

  const funcs = {
    setIncome: (income: Dinero) => dispatch({ type: 'income', income }),
    removeExpense: (expenseName: string) => dispatch({ type: 'removeExpense', expenseName }),
    setExpense: (expenseName: string, value: FixedExpense | PercentExpense) => dispatch({ type: 'setExpense', expenseName, value }),
    // setAll: (state: IIncomeExpenseState) => dispatch({ type: 'setAll', state }),
    setFromJson: (data: IncomeAndExpensesJson) => {
      const newExpenses: IExpenses = {};
      for (const expense of data.expenses) {
        if (expense.Expense) {
          newExpenses[expense.Expense[0]] = new FixedExpense(DineroBuilder(expense.Expense[1]));
        }
        else if (expense.ExpensePercentage) {
          newExpenses[expense.ExpensePercentage[0]] = new PercentExpense(expense.ExpensePercentage[1]);
        }
      }
      dispatch({ type: 'setAll', state: { income: DineroBuilder(data.income[0]), expenses: newExpenses } });
    },
  }

  const netIncome = useMemo(() => {
    let netIncome = state.income;
    for (const expensive of Object.values(state.expenses)) {
      netIncome = netIncome.subtract(expensive.getAmount(state.income));
    }
    return netIncome;
  }, [state.income, state.expenses]);

  const expenseNameList = useMemo(() => Object.keys(state.expenses), [state.expenses]);

  const computed = {
    netIncome,
    expenseNameList
  };

  return [state, funcs, computed];
};


