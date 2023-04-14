import { AppBar, Button, IconButton, Menu, Paper, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import MenuIcon from '@mui/icons-material/Menu';
import { CurrencyInput, PercentageInput } from "../components/NumericInput";
import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";

import './BudgetEstimate.css';

import { Chart } from 'react-chartjs-2';
import { useMemo, useState } from "react";
import { FixedExpense, PercentExpense } from "../data";
import FileMenu from "../components/FileMenu";
import { IncomeAndExpensesJson } from "../rust-types/IncomeAndExpensesJson";
import { ExpensesJson } from "../rust-types/ExpensesJson";
import NewExpenseDialog from "../components/NewExpense";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

interface IExpenses {
  [key: string]: FixedExpense | PercentExpense;
}

function getAllState(income: Dinero, expenses: IExpenses): IncomeAndExpensesJson {
  const transformedExpenses: ExpensesJson[] = [];
  for (let [k, v] of Object.entries(expenses)) {
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
    income: [income],
    expenses: transformedExpenses,
  };
}

function BudgetEstimate(props: {}) {
  const [income, setIncome] = useState<Dinero>(DineroBuilder({ amount: 0, currency: 'USD' }));
  const [expenses, setExpenses] = useState<IExpenses>({
    'Savings': new PercentExpense(0),
    'Donations': new PercentExpense(0),
    'Monthly Rent': new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })),
    'Monthly Groceries': new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })),
  });


  let netIncome = income;
  for (const expensive of Object.values(expenses)) {
    netIncome = netIncome.subtract(expensive.getAmount(income));
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function setBudgetData(data: IncomeAndExpensesJson) {
    setIncome(DineroBuilder(data.income[0]));
    const newExpenses: IExpenses = {};
    for (const expense of data.expenses) {
      if (expense.Expense) {
        newExpenses[expense.Expense[0]] = new FixedExpense(DineroBuilder(expense.Expense[1]));
      }
      else if (expense.ExpensePercentage) {
        newExpenses[expense.ExpensePercentage[0]] = new PercentExpense(expense.ExpensePercentage[1]);
      }
    }
    setExpenses(newExpenses);
    setResetKey(key => key + 1);
    setAnchorEl(null);
  }

  const [resetKey, setResetKey] = useState(0);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const expenseNameList = useMemo(() => Object.keys(expenses), [expenses]);
  const [expenseEdit, setExpenseEdit] = useState(false);

  return <>
    <NewExpenseDialog
      key={expenseDialogOpen + ''}
      open={expenseDialogOpen}
      onClose={() => setExpenseDialogOpen(false)}
      allExpenses={expenseNameList}
      newExpense={(name, expenseType) => {
        if (expenseType === 'fixed') {
          setExpenses({ ...expenses, [name]: new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })) });
        } else if (expenseType === 'percent') {
          setExpenses({ ...expenses, [name]: new PercentExpense(0) });
        }
      }}
    />
    <AppBar position="static" sx={{
      marginBottom: '2rem',
    }}>
      <Toolbar>
        <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1 }}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} >
          <FileMenu
            getBudgetData={() => getAllState(income, expenses)}
            setBudgetData={setBudgetData}
            onExpenseAdd={() => { setExpenseDialogOpen(true); setAnchorEl(null) }}
            onExpenseEdit={() => { setExpenseEdit(true); setAnchorEl(null) }} />
        </Menu>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          Budget Estimate
        </Typography>

      </Toolbar>
    </AppBar>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }} key={resetKey}>

      <Typography variant="h2"></Typography>
      {/* <Button onClick={save}>Stuff</Button> */}

      <div className="main-paper-box">
        <div className="sub-paper-box-1">
          <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
            <Typography variant="h4">Income</Typography>
            <CurrencyInput sx={{
              margin: '1rem',
            }} props={{
              label: 'Monthly Income',
              size: 'small',
            }} onChange={setIncome} value={income} />
          </Paper>

          <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
            <Typography variant="h4">Expenses</Typography>

            {Object.entries(expenses).map(([name, expense]) => {
              if (expense instanceof FixedExpense) {
                return <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {expenseEdit ? <IconButton sx={{
                    marginRight: '-1rem',
                  }} onClick={() => setExpenses(
                    allExpenses => {
                      const newExpenses = { ...allExpenses };
                      delete newExpenses[name];
                      return newExpenses;
                    }
                  )}>
                    <RemoveCircleIcon color={'error'} />
                  </IconButton> : null}
                  <CurrencyInput value={expense.amount} key={name} sx={{
                    margin: '1rem',
                  }} props={{
                    label: name,
                    size: 'small',
                  }} onChange={amount => setExpenses(allExpenses => { return { ...allExpenses, [name]: new FixedExpense(amount) } })} />

                </Box>;
              } else if (expense instanceof PercentExpense) {
                return <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {expenseEdit ? <IconButton sx={{
                    marginRight: '-1rem',
                  }} onClick={() => setExpenses(
                    allExpenses => {
                      const newExpenses = { ...allExpenses };
                      delete newExpenses[name];
                      return newExpenses;
                    }
                  )}>
                    <RemoveCircleIcon color={'error'} />
                  </IconButton> : null}
                  <PercentageInput value={expense.percentage} key={name} sx={{
                    margin: '1rem',
                  }} props={{
                    label: name,
                    size: 'small',
                  }} onChange={amount => setExpenses(allExpenses => { return { ...allExpenses, [name]: new PercentExpense(amount) } })} />
                </Box>;
              }
            })}

            {expenseEdit ? <Button variant="outlined" sx={{ margin: '1rem' }}>
              <Typography variant="body1" onClick={() => setExpenseEdit(false)}>Done editing expenses</Typography>
            </Button> : null}
          </Paper>
        </div>
        <div className="sub-paper-box-2">
          <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }}>
            <Typography variant="h4">Net Income</Typography>
            <Typography variant="h4">{netIncome.toFormat('$0,0.00')}</Typography>

            <div className="donut-chart-box">
              <Chart className="donut-chart" type='doughnut' data={{
                labels: [...Object.keys(expenses), 'Net Income'],
                datasets: [
                  {
                    label: 'Expenses',
                    data: [...Object.entries(expenses).map(([_, expense]) => expense.getAmount(income).getAmount() / 100), netIncome.getAmount() / 100],
                  }
                ]
              }}
              />
            </div>
          </Paper>
        </div>
      </div>

    </Box>
  </>;
}

export default BudgetEstimate;
