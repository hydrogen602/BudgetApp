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
  onClose: () => void;
}


export default function FileMenu({ onClose, saveHandler, saveAsHandler, openHandler, onExpenseAdd, onExpenseEdit }: IFileMenuProps) {

  const wrapWithClose = (handler: () => void) => {
    return () => {
      onClose();
      handler();
    };
  }

  return (
    // <Paper sx={{ width: 320, maxWidth: '100%' }}>
    <MenuList>
      <MenuItem onClick={wrapWithClose(saveHandler)}>
        <ListItemIcon>
          <SaveIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={wrapWithClose(saveAsHandler)}>
        <ListItemIcon>
          <SaveAsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Save As...
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={wrapWithClose(openHandler)}>
        <ListItemIcon>
          <FileOpenIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Open...
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={wrapWithClose(onExpenseAdd)}>
        <ListItemIcon>
          <AddIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          New Expense
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={wrapWithClose(onExpenseEdit)}>
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