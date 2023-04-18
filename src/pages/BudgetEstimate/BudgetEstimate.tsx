import { AppBar, Button, IconButton, Menu, Paper, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import MenuIcon from '@mui/icons-material/Menu';
import TuneIcon from '@mui/icons-material/Tune';
import { CurrencyInput, PercentageInput } from "../../components/NumericInput";
// import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";
import { appWindow } from "@tauri-apps/api/window";


import './BudgetEstimate.css';

import { Chart } from 'react-chartjs-2';
import { useContext, useEffect, useState } from "react";
import { FixedExpense, PercentExpense } from "../../data";
import FileMenu from "../../components/FileMenu";
import { IncomeAndExpensesJson } from "../../rust-types/IncomeAndExpensesJson";
import NewExpenseDialog from "../../components/NewExpense";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import IncomeOptions from "../../components/IncomeOptions";
import { load, save, saveAs } from "../../functions/fileOps";
import { SnackbarContext } from "../../App";
import { getAllState, useResetKey } from "./utils";
import useIncomeExpenseReducer from "./stateReducer";
import useShortcut from "../../functions/shortcuts";



// const shortcuts = ['CommandOrControl+Shift+S', 'CommandOrControl+O', 'CommandOrControl+S'];
// useEffect(() => {
//   (async () => {
//     console.log('Registering shortcuts');
//     for (const shortcut of shortcuts) {
//       if (await isRegistered(shortcut)) {
//         await unregister(shortcut);
//       }
//     }

//     await registerAll(['CommandOrControl+Shift+S', 'CommandOrControl+O', 'CommandOrControl+S'], (shortcut: string) => {
//       console.log('shortcut!');
//       switch (shortcut) {
//         case 'CommandOrControl+Shift+S':
//           saveAsHandler();
//           break;
//         case 'CommandOrControl+O':
//           openHandler();
//           break;
//         case 'CommandOrControl+S':
//           saveHandler();
//           break;
//       }
//     })
//   })();

//   return () => {
//     (async () => {
//       console.log('unregistering shortcuts');
//       for (const shortcut of shortcuts) {
//         if (await isRegistered(shortcut)) {
//           await unregister(shortcut);
//         }
//       }
//     })();
//   };
// }, [filename, income, expenses]);




function BudgetEstimate(props: {}) {
  const snackbar = useContext(SnackbarContext);

  const [incomeExpensesState, stateModifer, computed] = useIncomeExpenseReducer();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function setBudgetData(data: IncomeAndExpensesJson) {
    stateModifer.setFromJson(data);
    doResetKey();
    setAnchorEl(null);
  }

  const [resetKey, doResetKey] = useResetKey();


  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseEdit, setExpenseEdit] = useState(false);

  const [incomeOptsOpen, setIncomeOptsOpen] = useState(false);

  const [filename, setFilename] = useState<string | null>(null);

  useEffect(() => {
    const lastPart = filename?.split('/').pop();

    appWindow.setTitle(lastPart ? `Budget Estimate - ${lastPart}` : 'Budget Estimate');

    return () => {
      appWindow.setTitle('Budget Estimate');
    }
  }, [filename]);

  const saveHandler = async () => {
    try {
      let f = await save(filename, getAllState(incomeExpensesState))
      setFilename(f);
      snackbar({ message: 'Saved', severity: 'success' });
    }
    catch (e) {
      snackbar({ message: `Error saving file: ${e}`, severity: 'error' });
      console.error(e);
    }
  };

  const saveAsHandler = async () => {
    try {
      let f = await saveAs(getAllState(incomeExpensesState))
      setFilename(f);
      snackbar({ message: 'Saved', severity: 'success' });
    }
    catch (e) {
      snackbar({ message: `Error saving file: ${e}`, severity: 'error' });
      console.error(e);
    }
  };

  const openHandler = async () => {
    try {
      let [f, data] = await load();
      setFilename(f);
      setBudgetData(data);
      snackbar({ message: 'Opened', severity: 'success' });
    }
    catch (e) {
      snackbar({ message: `Error opening file: ${e}`, severity: 'error' });
      console.error(e);
    }
  };

  useShortcut('CommandOrControl+Shift+S', saveAsHandler);
  useShortcut('CommandOrControl+O', openHandler);
  useShortcut('CommandOrControl+S', saveHandler);

  return <>
    <NewExpenseDialog
      key={expenseDialogOpen + ''}
      open={expenseDialogOpen}
      onClose={() => setExpenseDialogOpen(false)}
      allExpenses={computed.expenseNameList}
      newExpense={(name, expenseType) => {
        if (expenseType === 'fixed') {
          stateModifer.setExpense(name, new FixedExpense(DineroBuilder({ amount: 0, currency: 'USD' })));
        } else if (expenseType === 'percent') {
          stateModifer.setExpense(name, new PercentExpense(0));
        }
      }}
    />
    <IncomeOptions open={incomeOptsOpen} onClose={() => setIncomeOptsOpen(false)} setIncome={(income) => {
      stateModifer.setIncome(income);
      doResetKey();
    }} />
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
            onClose={() => setAnchorEl(null)}
            openHandler={openHandler}
            saveHandler={saveHandler}
            saveAsHandler={saveAsHandler}
            onExpenseAdd={() => setExpenseDialogOpen(true)}
            onExpenseEdit={() => setExpenseEdit(true)}
          />
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

      <div className="main-paper-box">
        <div className="sub-paper-box-1">
          <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
            <Typography variant="h4">Income</Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CurrencyInput sx={{
                margin: '1rem',
              }} props={{
                label: 'Monthly Income',
                size: 'small',
              }} onChange={stateModifer.setIncome} value={incomeExpensesState.income} />
              <IconButton onClick={() => setIncomeOptsOpen(true)}>
                <TuneIcon />
              </IconButton>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{ padding: '1.5rem', margin: '1rem' }} className="paper-box">
            <Typography variant="h4">Expenses</Typography>

            {Object.entries(incomeExpensesState.expenses).map(([name, expense]) => {
              if (expense instanceof FixedExpense) {
                return <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} key={name} >
                  {expenseEdit ? <IconButton sx={{
                    marginRight: '-1rem',
                  }} onClick={() => stateModifer.removeExpense(name)}>
                    <RemoveCircleIcon color={'error'} />
                  </IconButton> : null}
                  <CurrencyInput value={expense.amount} key={name} sx={{
                    margin: '1rem',
                  }} props={{
                    label: name,
                    size: 'small',
                  }} onChange={amount => stateModifer.setExpense(name, new FixedExpense(amount))} />

                </Box>;
              } else if (expense instanceof PercentExpense) {
                return <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} key={name}>
                  {expenseEdit ? <IconButton sx={{
                    marginRight: '-1rem',
                  }} onClick={() => stateModifer.removeExpense(name)}>
                    <RemoveCircleIcon color={'error'} />
                  </IconButton> : null}
                  <PercentageInput value={expense.percentage} key={name} sx={{
                    margin: '1rem',
                  }} props={{
                    label: name,
                    size: 'small',
                  }} onChange={amount => stateModifer.setExpense(name, new PercentExpense(amount))} />
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
            <Typography variant="h4">{computed.netIncome.toFormat('$0,0.00')}</Typography>

            <div className="donut-chart-box" style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
              <Chart className="donut-chart" type='doughnut' data={{
                labels: [...computed.expenseNameList, 'Net Income'],
                datasets: [
                  {
                    label: 'Expenses',
                    data: [...Object.entries(incomeExpensesState.expenses).map(([_, expense]) => expense.getAmount(incomeExpensesState.income).getAmount() / 100), computed.netIncome.getAmount() / 100],
                  }
                ]
              }}
              />
            </div>
            {incomeExpensesState.expenses['Savings'] ? <Typography variant="body1">Savings per year: {incomeExpensesState.expenses['Savings'].getAmount(incomeExpensesState.income).multiply(12).toFormat('$0,0.00')}</Typography> : null}

          </Paper>
        </div>
      </div>

    </Box>
  </>;
}

export default BudgetEstimate;
