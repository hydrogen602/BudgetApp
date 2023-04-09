import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { CurrencyInput, PercentageInput } from "../components/NumericInput";
import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";

import './BudgetEstimate.css';

import { Chart } from 'react-chartjs-2';
import { useState } from "react";
import { FixedExpense, PercentExpense } from "../data";

interface IExpenses {
  [key: string]: FixedExpense | PercentExpense;
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

  console.log(netIncome, JSON.stringify(netIncome))


  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Typography variant="h2">Budget Estimate</Typography>

    <div className="main-paper-box">
      <div className="sub-paper-box-1">
        <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
          <Typography variant="h4">Income</Typography>
          <CurrencyInput sx={{
            margin: '1rem',
          }} props={{
            label: 'Monthly Income',
            size: 'small',
          }} onChange={setIncome} />
        </Paper>

        <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
          <Typography variant="h4">Expenses</Typography>

          {Object.entries(expenses).map(([name, expensive]) => {
            if (expensive instanceof FixedExpense) {
              return <CurrencyInput key={name} sx={{
                margin: '1rem',
              }} props={{
                label: name,
                size: 'small',
              }} onChange={amount => setExpenses(allExpenses => { return { ...allExpenses, [name]: new FixedExpense(amount) } })} />;
            } else if (expensive instanceof PercentExpense) {
              return <PercentageInput key={name} sx={{
                margin: '1rem',
              }} props={{
                label: name,
                size: 'small',
              }} onChange={amount => setExpenses(allExpenses => { return { ...allExpenses, [name]: new PercentExpense(amount) } })} />;
            }
          })}
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

  </Box>;
}

export default BudgetEstimate;
