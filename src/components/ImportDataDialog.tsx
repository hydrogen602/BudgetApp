import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { Openable } from "./commonTypes";
import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { dialog, fs } from "@tauri-apps/api";
import { parse as parseCSV } from "csv-parse/browser/esm/sync";
import { SnackbarContext, SnackbarMessage } from "../App";
import { IStandardRecord, IStandardRecords, parseStandardRecord } from "../pages/Records";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { Dinero } from "dinero.js";
import ColumnMapper, { CSVHeaders, CSVRecord, CSVRecords, IColumnMapping } from "./ColumnMapper";


interface IImportDataDialogProps extends Openable {
  onSubmit: (data: IStandardRecords) => void,
}

const columns: GridColDef[] = [
  { field: 'Date', headerName: 'Date', width: 150, valueFormatter: ({ value }) => value.format('MMM D, YYYY') },
  { field: 'Description', headerName: 'Description', flex: 1, editable: true },
  { field: 'Amount', headerName: 'Amount', width: 100, valueFormatter: ({ value }) => value.toFormat('$0,0.00'), sortComparator: (v1: Dinero, v2: Dinero) => v1.subtract(v2).getAmount() },
  { field: 'Category', headerName: 'Category', flex: 1, editable: true },
];

async function loadRecords(): Promise<CSVRecords> {
  const options: dialog.OpenDialogOptions = {
    title: 'Open File',
    defaultPath: './',
    filters: [
      {
        name: 'CSV files',
        extensions: ['csv'],
      },
    ],
    multiple: false
  };


  const filenameResult = await dialog.open(options);
  if (filenameResult) {
    // The user selected a file to save.
    const dataString = await fs.readTextFile(filenameResult as string);
    const data = parseCSV(dataString, { bom: true, columns: true }) as CSVRecord[];

    const headers = data[0] ? Object.keys(data[0]) : [];

    return [data, headers];
  } else {
    throw new Error("User canceled open dialog");
  }
}

type IImportState = {
  activeStep: 0
} | {
  activeStep: 1,
  rawRecordsData: CSVRecord[],
  rawRecordsHeaders: CSVHeaders,
} | {
  activeStep: 2,
  records: IStandardRecord[],
};

type IImportAction = {
  type: 'loadRawRecords',
  data: CSVRecord[],
  headers: CSVHeaders,
} | {
  type: 'remapRecords',
  columnMapping: IColumnMapping,
};

function importReducerRaw(state: IImportState, action: IImportAction, snackbar: (_: SnackbarMessage) => void): IImportState {
  try {
    switch (action.type) {
      case 'loadRawRecords':
        if (state.activeStep !== 0) throw new Error(`Invalid state transition from ${state.activeStep} to ${1} in importReducer`);
        return {
          activeStep: 1,
          rawRecordsData: action.data,
          rawRecordsHeaders: action.headers,
        };
      case 'remapRecords':
        if (state.activeStep !== 1) throw new Error(`Invalid state transition from ${state.activeStep} to ${2} in importReducer`);
        const parsedData = state.rawRecordsData.map((record, i) => {
          const id = `idx_${i}`;
          return parseStandardRecord(
            record[action.columnMapping.Amount || ''],
            record[action.columnMapping.Date || ''],
            record[action.columnMapping.Category || ''],
            record[action.columnMapping.Description || ''],
            id
          );
        });

        return {
          activeStep: 2,
          records: parsedData,
        };
      default:
        throw new Error(`Invalid action type ${action} in importReducer`);
    }
  }
  catch (e) {
    snackbar({ message: `Failed to parse data: ${e}`, severity: 'error' });
    console.error(e);
    throw e;
  }
}

export default function ImportDataDialog({ open, onClose, onSubmit }: IImportDataDialogProps) {
  const snackbar = useContext(SnackbarContext);
  const importReducer = useCallback((state: IImportState, action: IImportAction) => {
    return importReducerRaw(state, action, snackbar);
  }, [snackbar]);

  const [importState, updateImportState] = useReducer(importReducer, { activeStep: 0 });

  const openHandler = async () => {
    try {
      const [data, headers] = await loadRecords();
      updateImportState({ type: 'loadRawRecords', data, headers });
    } catch (e) {
      snackbar({ message: `Error opening file: ${e}`, severity: 'error' });
      console.error(e);
      // onClose(); TODO: reenable this
    }
  };

  useEffect(() => {
    if (open) {
      openHandler();
    }
  }, [open]);

  const nextButtonBoxRef = useRef(null as null | HTMLDivElement);

  const apiRef = useGridApiRef();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={false}>
      <DialogTitle>Import Data</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', marginTop: '5px' }}>
          <Stepper activeStep={importState.activeStep} sx={{ marginBottom: '1ex' }}>
            <Step key={0}>
              <StepLabel>Load Data</StepLabel>
            </Step>
            <Step key={1}>
              <StepLabel>Map Columns</StepLabel>
            </Step>
            <Step key={2}>
              <StepLabel>View & Edits</StepLabel>
            </Step>
          </Stepper>
        </Box>
        {importState.activeStep === 0 ? <Typography variant="body1">Loading data...</Typography> : null}
        {importState.activeStep === 1 ?
          <>
            <DialogContentText sx={{ marginBottom: '1ex' }}>
              Column titles: {importState.rawRecordsHeaders.join(', ')}
              <br />
              Loaded {importState.rawRecordsData.length} rows.
            </DialogContentText>
            <Typography variant="h6">Column Mapping</Typography>
            <DialogContentText>
              Please select the columns from the imported data that correspond to the fields below.
            </DialogContentText>
            <ColumnMapper recordsHeaders={importState.rawRecordsHeaders} buttonPortalRef={nextButtonBoxRef} onSubmit={columnMapping => updateImportState({ type: 'remapRecords', columnMapping })} />
          </> : null}
        {importState.activeStep === 2 ?
          <Box sx={{ height: 400, width: '100%', paddingBottom: '2rem' }}>
            <DataGrid
              columns={columns}
              rows={importState.records}
              sx={{
                marginTop: '1rem',
              }}
              apiRef={apiRef}
            />
          </Box>
          : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ marginRight: '0.5rem' }}>Cancel</Button>
        {importState.activeStep === 0 ? <Button onClick={openHandler} variant="contained">Open File</Button> : null}
        {importState.activeStep === 1 ? <Box ref={nextButtonBoxRef} /> : null}
        {importState.activeStep === 2 ? <Button onClick={() => {
          if (apiRef.current) {
            const data: IStandardRecords = [];
            apiRef.current.getRowModels().forEach((row) => { data.push(row as IStandardRecord); });

            onSubmit(data);
            onClose();
          }
          else {
            snackbar({ message: 'Failed to get data from grid, apiRef is null', severity: 'error' });
            console.error('Failed to get data from grid, apiRef is null');
          }
        }} variant="contained">Submit</Button> : null}
      </DialogActions>
    </Dialog >
  );
};