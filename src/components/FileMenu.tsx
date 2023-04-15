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
import { Divider } from '@mui/material';


interface IFileMenuProps {
  onExpenseAdd: () => void;
  onExpenseEdit: () => void;
  saveHandler: () => void;
  saveAsHandler: () => void;
  openHandler: () => void;
}


export default function FileMenu({ saveHandler, saveAsHandler, openHandler, onExpenseAdd, onExpenseEdit }: IFileMenuProps) {

  return (
    // <Paper sx={{ width: 320, maxWidth: '100%' }}>
    <MenuList>
      <MenuItem onClick={saveHandler}>
        <ListItemIcon>
          <SaveIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={saveAsHandler}>
        <ListItemIcon>
          <SaveAsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save As...
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={openHandler}>
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