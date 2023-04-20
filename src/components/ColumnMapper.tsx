import { Box, Button, InputLabel, MenuItem, Portal, Select, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";

export interface CSVRecord {
  [key: string]: string;
}

export type CSVHeaders = string[];

export type CSVRecords = [CSVRecord[], CSVHeaders];

export interface IColumnMapping {
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
  if (newState[action.field] === undefined) {
    throw new Error(`Invalid field ${action.field} in stateReducer`);
  }
  newState[action.field] = action.value;

  return newState;
}


export default function ColumnMapper({ recordsHeaders, onSubmit, buttonPortalRef }: { recordsHeaders: CSVHeaders, onSubmit: (_: IColumnMapping) => void, buttonPortalRef: React.RefObject<HTMLDivElement | null> }) {
  const [columnMapping, updateColumnMapping] = useReducer(stateReducer, { Amount: null, Date: null, Category: null, Description: null });

  useEffect(() => {
    // if some column has the same name as a field, set it automatically
    recordsHeaders.forEach((header) => {
      let lowerHeader = header.toLowerCase();
      if (lowerHeader === 'amount' && !columnMapping.Amount) {
        updateColumnMapping({ field: 'Amount', value: header });
      }
      if (lowerHeader === 'date' && !columnMapping.Date) {
        updateColumnMapping({ field: 'Date', value: header });
      }
      if (lowerHeader === 'category' && !columnMapping.Category) {
        updateColumnMapping({ field: 'Category', value: header });
      }
      if (lowerHeader === 'description' && !columnMapping.Description) {
        updateColumnMapping({ field: 'Description', value: header });
      }
    });

  }, [recordsHeaders]);

  function OneColumnMapper({ column, idx, recordsHeaders }: { column: IColumnNames, idx: number, recordsHeaders: CSVHeaders }) {
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
            recordsHeaders.map((header) =>
              <MenuItem key={header} value={header}>{header}</MenuItem>
            )
          }
        </Select>

      </>
    );
  }

  return <>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr 1fr',
      rowGap: '1ex',
      columnGap: '1ex',
    }}>
      <OneColumnMapper column="Amount" idx={1} recordsHeaders={recordsHeaders} />
      <OneColumnMapper column="Date" idx={2} recordsHeaders={recordsHeaders} />
      <OneColumnMapper column="Category" idx={3} recordsHeaders={recordsHeaders} />
      <OneColumnMapper column="Description" idx={4} recordsHeaders={recordsHeaders} />
    </Box>
    <Portal container={buttonPortalRef.current}>
      <Button
        onClick={() => onSubmit(columnMapping)}
        variant="contained"
        disabled={!Object.values(columnMapping).every(e => e)}>
        Apply Columns
      </Button>
    </Portal>
  </>;

}