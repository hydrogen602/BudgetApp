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
import { useContext } from 'react';
import { SnackbarContext } from '../App';
import { IncomeAndExpensesJson } from '../rust-types/IncomeAndExpensesJson';
import { Divider } from '@mui/material';


interface IFileMenuProps {
  onExpenseAdd: () => void;
  onExpenseEdit: () => void;
  getBudgetData: () => IncomeAndExpensesJson;
  setBudgetData: (_: IncomeAndExpensesJson) => void;
}


export default function FileMenu({ getBudgetData, setBudgetData, onExpenseAdd, onExpenseEdit }: IFileMenuProps) {
  const snackbar = useContext(SnackbarContext)

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

    const result = await dialog.save(options);
    if (result) {
      console.log(`File path: ${result}`);
      // The user selected a file to save.
      try {
        return await saveToDisk(result, getBudgetData());
      } catch (e) {
        console.error(e);
        snackbar(`Error saving file: ${e}`)
      }
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

    const result = await dialog.open(options);
    if (result) {
      console.log(`File path: ${result}`);
      // The user selected a file to save.
      try {
        const data = await loadFromDisk(result as string);
        setBudgetData(data);
        return;
      } catch (e) {
        console.error(e);
        snackbar(`Error saving file: ${e}`)
      }
    } else {
      // The user canceled the save dialog.
    }
  }


  return (
    // <Paper sx={{ width: 320, maxWidth: '100%' }}>
    <MenuList>
      <MenuItem onClick={() => alert("Not implemented yet")}>
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