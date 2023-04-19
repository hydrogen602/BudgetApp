import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { Openable } from "./commonTypes";
import { useContext, useEffect, useReducer, useState } from "react";
import { dialog, fs } from "@tauri-apps/api";
import { parse as parseCSV } from "csv-parse/browser/esm/sync";
import { SnackbarContext } from "../App";


interface IImportDataDialogProps extends Openable {
  onSubmit: (columnMapping: IColumnMapping, data: CSVRecords) => void,
}


interface IColumnMapping {
  'Amount': string | null,
  'Date': string | null,
  'Category': string | null,
  'Description': string | null,
}
type IColumnNames = keyof IColumnMapping;

function stateReducer(state: IColumnMapping, action: { field: IColumnNames, value: string | null }): IColumnMapping {
  // IColumnMapping should be a one-to-one mapping,
  // so if the value set is already used, reset it

  const newState: IColumnMapping = { ...state };
  if (action.value) {
    // I want to set any field to null if it has the same value as the given value
    let field: IColumnNames;
    // this is stupid but Object.keys returns string[], not keyof IColumnMapping
    for (field of (Object.keys(newState) as any)) {
      if (newState[field] === action.value) {
        // if we already used the value somewhere, reset it
        newState[field] = null;
      }
    }
  }

  // check that the field is valid
  console.assert(newState[action.field] !== undefined,
    `Invalid field ${action.field} in stateReducer`);
  newState[action.field] = action.value;

  return newState;
}

interface CSVRecord {
  [key: string]: string;
}

type CSVHeaders = string[];

type CSVRecords = [CSVRecord[], CSVHeaders];

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
    throw "User canceled open dialog";
  }
}

export default function ImportDataDialog({ open, onClose, onSubmit }: IImportDataDialogProps) {
  const snackbar = useContext(SnackbarContext);

  const [rawRecords, setRecords] = useState<CSVRecords | null>(null);
  const recordsData = rawRecords ? rawRecords[0] : null;
  const recordsHeaders = rawRecords ? rawRecords[1] : null;

  const openHandler = async () => {
    try {
      let data = await loadRecords();
      setRecords(data);
    } catch (e) {
      snackbar({ message: `Error opening file: ${e}`, severity: 'error' });
      console.error(e);
    }
  };

  useEffect(() => {
    if (open) {
      openHandler();
    }
  }, [open]);

  // useEffect(() => {
  //   if (rawRecords) {
  //     TODO: if some column has the same name as a field, set it automatically
  //   }
  // }, [rawRecords])

  const [columnMapping, updateColumnMapping] = useReducer(stateReducer, { Amount: null, Date: null, Category: null, Description: null });

  function OneColumnMapper({ column, idx }: { column: IColumnNames, idx: number }) {
    return (
      <>
        <InputLabel id={`import-dialog-${column}-label`} sx={{
          gridColumn: '1 / 2',
          gridRow: `${idx} / span 1`,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          alignContent: 'center',
        }}><Typography variant="h6" >{column}</Typography></InputLabel>
        <Select
          labelId={`import-dialog-${column}-label`}
          value={columnMapping[column] || ''}
          label={column}
          onChange={ev =>
            updateColumnMapping({ field: column, value: ev.target.value })
          }
          sx={{
            gridColumn: '2 / 3',
            gridRow: `${idx} / span 1`,
          }}
          renderValue={(value) => value || 'None'}
        >
          {
            (recordsHeaders || []).map((header) =>
              <MenuItem key={header} value={header}>{header}</MenuItem>
            )
          }
        </Select>
      </>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} >
      <DialogTitle>Import Data</DialogTitle>
      <DialogContent>
        {recordsData && recordsHeaders ?
          <>
            <DialogContentText sx={{ marginBottom: '1ex' }}>
              Column titles: {recordsHeaders.join(', ')}
              <br />
              Loaded {recordsData.length} rows.
            </DialogContentText>
            <Typography variant="h6">Column Mapping</Typography>
            <DialogContentText>
              Please select the columns from the imported data that correspond to the fields below.
            </DialogContentText>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr 1fr',
              rowGap: '1ex',
              columnGap: '1ex',
            }}>
              <OneColumnMapper column="Amount" idx={1} />
              <OneColumnMapper column="Date" idx={2} />
              <OneColumnMapper column="Category" idx={3} />
              <OneColumnMapper column="Description" idx={4} />
            </Box>
          </>
          : <Typography variant="body1">Loading data...</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => {
          if (rawRecords) {
            onClose();
            onSubmit(columnMapping, rawRecords);
          } else {
            console.assert(false, "rawRecords is null in ImportDataDialog");
          }
        }} variant="contained" disabled={!Object.values(columnMapping).every(e => e) || !rawRecords}>Import</Button>
      </DialogActions>
    </Dialog >
  );
};