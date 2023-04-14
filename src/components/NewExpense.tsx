import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export type ExpenseType = 'percent' | 'fixed';

export interface INewExpenseDialogProps {
  open: boolean,
  onClose: () => void,
  allExpenses: string[],
  newExpense: (name: string, expenseType: ExpenseType) => void,
}

export default function NewExpenseDialog({ open, onClose, allExpenses, newExpense }: INewExpenseDialogProps) {
  const [name, setName] = useState('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('fixed');

  const allExpensesSet = useMemo(() => new Set(allExpenses.map((e) => e.toLowerCase())), [allExpenses]);

  const isDuplicate = allExpensesSet.has(name.toLowerCase());

  return <Dialog open={open} onClose={onClose}>
    <DialogTitle>New Expense</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ marginTop: '1ex', marginBottom: '1ex' }}>
        Enter the name of the expense you want to add.
      </DialogContentText>
      <TextField autoFocus label="Expense name" type="text" sx={{ marginTop: '1ex', minWidth: '20em', marginBottom: '1ex' }}
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        error={isDuplicate}
        helperText={isDuplicate ? 'An expense with this name exists already' : null}
        fullWidth />

      <DialogContentText sx={{ marginTop: '1ex', marginBottom: '1ex' }}>
        Select the type of expense you want to add. Fixed expenses are a fixed amount per month, while percent expenses are a percentage of your income.
      </DialogContentText>
      <ToggleButtonGroup
        sx={{ marginTop: '1ex', marginBottom: '1ex' }}
        color="primary"
        value={expenseType}
        exclusive
        onChange={(_, val) => {
          if (val) {
            setExpenseType(val as ExpenseType);
          }
        }}
        aria-label="Expense type"
      >
        <ToggleButton value="fixed">Fixed</ToggleButton>
        <ToggleButton value="percent">Percent</ToggleButton>
      </ToggleButtonGroup>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => {
        newExpense(name, expenseType);
        onClose();
      }} disabled={name === '' || isDuplicate}>Create</Button>
    </DialogActions>
  </Dialog>
}