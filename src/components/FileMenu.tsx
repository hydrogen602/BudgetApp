// import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SaveIcon from '@mui/icons-material/Save';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { dialog } from '@tauri-apps/api';
import { saveToDisk } from '../rust-invoke';

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
    await saveToDisk(result);
  } else {
    // The user canceled the save dialog.
  }
}



export default function FileMenu() {
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
      <MenuItem>
        <ListItemIcon>
          <FileOpenIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Open...
        </ListItemText>
      </MenuItem>
    </MenuList >

  ); /* </Paper> */
}