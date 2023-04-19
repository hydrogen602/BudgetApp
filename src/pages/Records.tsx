import { AppBar, IconButton, Menu, Paper, Toolbar, Typography } from "@mui/material";
import BottomNav from "../components/BottomNav";
import MenuIcon from '@mui/icons-material/Menu';
import { useContext, useEffect, useState } from "react";
import FileMenu from "../components/FileMenu";
import { SnackbarContext } from "../App";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ImportDataDialog from "../components/ImportDataDialog";
import { useResetKey } from "./BudgetEstimate/utils";
// import { DataGrid } from '@mui/x-data-grid';




const columns: GridColDef[] = [
  { field: 'Date', headerName: 'Date', width: 70 },
  { field: 'Description', headerName: 'Description', width: 150 },
  { field: 'Amount', headerName: 'Amount', width: 30 },
  { field: 'Category', headerName: 'Category', width: 70 },
];


export default function Records() {
  const snackbar = useContext(SnackbarContext);

  const [resetKey, doReset] = useResetKey();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importOpen, setImportOpen] = useState(false);

  return (<>
    <ImportDataDialog
      key={resetKey}
      open={importOpen}
      onClose={() => setImportOpen(false)}
      onSubmit={(mapping, [data, _]) => {
        console.log(mapping, data);
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
        <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => {
          setAnchorEl(null);
          // reset the dialog when closing
          doReset();
        }} >
          <FileMenu
            onClose={() => setAnchorEl(null)}
            openHandler={() => setImportOpen(true)}
          />
        </Menu>
        <Typography variant="body1" component="div" sx={{ flexGrow: 1 }}>
          Records
        </Typography>
      </Toolbar>
    </AppBar>
    <div>
      Records
    </div>
    <Paper sx={{
      padding: '1rem',
      margin: '1rem',
    }}>
      Sup
    </Paper>
    <DataGrid
      columns={columns}
      rows={[]}
    />
    <BottomNav />
  </>
  );
}