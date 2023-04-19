import { AppBar, Box, IconButton, Menu, Paper, Toolbar, Typography } from "@mui/material";
import BottomNav from "../components/BottomNav";
import MenuIcon from '@mui/icons-material/Menu';
import { useContext, useEffect, useState } from "react";
import FileMenu from "../components/FileMenu";
import { SnackbarContext } from "../App";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ImportDataDialog from "../components/ImportDataDialog";
import { useResetKey } from "./BudgetEstimate/utils";
// import { DataGrid } from '@mui/x-data-grid';

import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";
import { Dayjs } from "dayjs";
import { parseAmount } from "../functions/amountParser";

export interface IStandardRecord {
  'Amount': Dinero,
  'Date': string, // TODO: change to Dayjs
  'Category': string,
  'Description': string,
  'id': string,
}

export function parseStandardRecord(amount: string, date: string, category: string, description: string, id: string) {
  return {
    'Amount': parseAmount(amount),
    'Date': date,
    'Category': category,
    'Description': description,
    'id': id,
  };
}



export type IStandardRecords = IStandardRecord[];


const columns: GridColDef[] = [
  { field: 'Date', headerName: 'Date', width: 100 },
  { field: 'Description', headerName: 'Description', flex: 1 },
  { field: 'Amount', headerName: 'Amount', width: 100, valueFormatter: ({ value }) => value.toFormat('$0,0.00'), sortComparator: (v1: Dinero, v2: Dinero) => v1.subtract(v2).getAmount() },
  { field: 'Category', headerName: 'Category', flex: 1 },
];


export default function Records() {
  const snackbar = useContext(SnackbarContext);

  const [resetKey, doReset] = useResetKey();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [records, setRecords] = useState<IStandardRecords | null>(null);

  useEffect(() => {
    if (records) {
      snackbar({ 'message': `Loaded ${records.length} records`, 'severity': 'success' });
      console.log(records[0]);
    }
  }, [records]);


  return (<>
    <ImportDataDialog
      key={resetKey}
      open={importOpen}
      onClose={() => setImportOpen(false)}
      onSubmit={setRecords} />
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
    <Box sx={{ height: 400, width: '100%', paddingBottom: '2rem' }}>
      <DataGrid
        columns={columns}
        rows={records || []}
        sx={{
          margin: '1rem',
        }}
      />
    </Box>
    <BottomNav />
  </>
  );
}