// import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SaveIcon from '@mui/icons-material/Save';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { dialog } from '@tauri-apps/api';
import { loadFromDisk, saveToDisk } from '../rust-invoke';
import { useContext, useState } from 'react';
import { SnackbarContext } from '../App';
import { IncomeAndExpensesJson } from '../rust-types/IncomeAndExpensesJson';
import { Divider } from '@mui/material';


interface IFileMenuProps {
  onExpenseAdd: () => void;
  onExpenseEdit: () => void;
  getBudgetData: () => IncomeAndExpensesJson;
  setBudgetData: (_: IncomeAndExpensesJson) => void;
  filename: string | null,
  setFilename: (_: string | null) => void
}


export default function FileMenu({ getBudgetData, setBudgetData, onExpenseAdd, onExpenseEdit, filename, setFilename }: IFileMenuProps) {
  const snackbar = useContext(SnackbarContext);



  async function saveToFile(filename: string) {
    try {
      await saveToDisk(filename, getBudgetData());
      setFilename(filename);
    } catch (e) {
      console.error(e);
      snackbar(`Error saving file: ${e}`);
    }
  }

  async function save() {
    if (filename) {
      saveToFile(filename);
    }
    else {
      saveAs();
    }
  }

  async function saveAs() {
    const options: dialog.SaveDialogOptions = {
      title: 'Save File',
      defaultPath: './',
      filters: [
        {
          name: 'Json files',
          extensions: ['json'],
        },
      ],
    };
    const filenameResult = await dialog.save(options);

    if (filenameResult) {
      // The user selected a file to save.
      saveToFile(filenameResult);
    } else {
      // The user canceled the save dialog.
    }
  }

  async function load() {
    const options: dialog.OpenDialogOptions = {
      title: 'Open File',
      defaultPath: './',
      filters: [
        {
          name: 'Json files',
          extensions: ['json'],
        },
      ],
      multiple: false
    };

    const filenameResult = await dialog.open(options);
    if (filenameResult) {
      // The user selected a file to save.
      try {
        const data = await loadFromDisk(filenameResult as string);
        setBudgetData(data);
        setFilename(filenameResult as string);
        return;
      } catch (e) {
        console.error(e);
        snackbar(`Error saving file: ${e}`);
      }
    } else {
      // The user canceled the save dialog.
    }
  }


  return (
    // <Paper sx={{ width: 320, maxWidth: '100%' }}>
    <MenuList>
      <MenuItem onClick={save}>
        <ListItemIcon>
          <SaveIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={saveAs}>
        <ListItemIcon>
          <SaveAsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save As...
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={load}>
        <ListItemIcon>
          <FileOpenIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Open...
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onExpenseAdd}>
        <ListItemIcon>
          <AddIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          New Expense
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onExpenseEdit}>
        <ListItemIcon>
          <EditIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          Edit Expenses
        </ListItemText>
      </MenuItem>
    </MenuList >
  ); /* </Paper> */
}