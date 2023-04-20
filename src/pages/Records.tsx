import { AppBar, Box, Button, IconButton, Menu, Paper, Toolbar, Typography } from "@mui/material";
import BottomNav from "../components/BottomNav";
import MenuIcon from '@mui/icons-material/Menu';
import { useContext, useEffect, useReducer, useState } from "react";
import FileMenu from "../components/FileMenu";
import { SnackbarContext } from "../App";
import { DataGrid, GridCallbackDetails, GridCellEditStopParams, GridColDef, MuiEvent } from "@mui/x-data-grid";
import ImportDataDialog from "../components/ImportDataDialog";
import { useResetKey } from "./BudgetEstimate/utils";

import { Dinero } from "dinero.js";
import { Dayjs } from "dayjs";
import { parseAmount, parseDate } from "../functions/amountParser";

export interface IStandardRecord {
  'Amount': Dinero,
  'Date': Dayjs,
  'Category': string,
  'Description': string,
  'id': string,
}

export function parseStandardRecord(amount: string, date: string, category: string, description: string, id: string) {

  return {
    'Amount': parseAmount(amount),
    'Date': parseDate(date),
    'Category': category,
    'Description': description,
    'id': id,
  };
}



export type IStandardRecords = IStandardRecord[];


const columns: GridColDef[] = [
  { field: 'Date', headerName: 'Date', width: 150, valueFormatter: ({ value }) => value.format('MMM D, YYYY') },
  { field: 'Description', headerName: 'Description', flex: 1, editable: true },
  { field: 'Amount', headerName: 'Amount', width: 100, valueFormatter: ({ value }) => value.toFormat('$0,0.00'), sortComparator: (v1: Dinero, v2: Dinero) => v1.subtract(v2).getAmount() },
  { field: 'Category', headerName: 'Category', flex: 1, editable: true },
];

// interface IStandardRecordsContainer {
//   inner: IStandardRecords | null,
// };

// type ISetRecordsAction = {
//   type: 'setAllRecords',
//   records: IStandardRecords,
// } | {
//   type: 'setDescription',
//   id: string,
//   description: string,
// } | {
//   type: 'setCategory',
//   id: string,
//   category: string,
// };

// function recordsReducer(state: IStandardRecordsContainer, action: ISetRecordsAction): IStandardRecordsContainer {
//   let found = false;
//   switch (action.type) {
//     case 'setAllRecords':
//       return {
//         inner: action.records,
//       };
//     case 'setDescription':
//       for (const record of state.inner || []) {
//         if (record.id === action.id) {
//           record.Description = action.description;
//           found = true;
//         }
//       }
//       if (!found) {
//         throw new Error(`Could not find record with id ${action.id}`);
//       }
//       return { inner: state.inner };
//     case 'setCategory':
//       for (const record of state.inner || []) {
//         if (record.id === action.id) {
//           record.Category = action.category;
//           found = true;
//         }
//       }
//       if (!found) {
//         throw new Error(`Could not find record with id ${action.id}`);
//       }
//       return { inner: state.inner };
//     default:
//       throw new Error('Invalid action');
//   }
// }


export default function Records() {
  const snackbar = useContext(SnackbarContext);

  const [resetKey, doReset] = useResetKey();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importOpen, setImportOpen] = useState(false);

  // const [records, updateRecords] = useReducer(recordsReducer, { inner: null } as IStandardRecordsContainer);
  const [records, setRecords] = useState<IStandardRecords | null>(null);

  useEffect(() => {
    if (records) {
      snackbar({ 'message': `Loaded ${records?.length} records`, severity: 'success' });
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
    <Paper sx={{
      padding: '1rem',
      margin: '1rem',
    }}>
      idk
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