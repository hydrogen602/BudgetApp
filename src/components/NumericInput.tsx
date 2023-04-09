import { InputAdornment, SxProps, TextField, TextFieldProps } from "@mui/material";
import { Theme } from "@mui/system";
import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";
import { useState } from "react";

export interface IAmountInputProps<T> {
  onChange?: (amount: T) => void,
  props?: TextFieldProps,
  sx?: SxProps<Theme>,
  default_?: string,
}


export function CurrencyInput({ onChange, props, sx, default_ }: IAmountInputProps<Dinero>) {
  const [inputAmountRaw, setInputAmountRaw] = useState(default_ || '');

  return <TextField
    sx={sx}
    InputProps={{
      inputMode: 'numeric',
      endAdornment: <InputAdornment position="start">$</InputAdornment>,
    }}
    {...props}
    value={inputAmountRaw}
    onChange={(ev) => {
      const val = ev.target.value;
      if (val.match(/^[0-9]*([.][0-9]{0,2})?$/)) {
        console.log(val)
        setInputAmountRaw(val);
        if (onChange) {
          onChange(DineroBuilder({ amount: Math.round(100 * parseFloat(val || '0')), currency: 'USD' }));
        }
      }
    }}
  />;
}

export function PercentageInput({ onChange, props, sx }: IAmountInputProps<number>) {
  const [inputAmountRaw, setInputAmountRaw] = useState('');

  return <TextField
    sx={sx}
    InputProps={{
      inputMode: 'numeric',
      endAdornment: <InputAdornment position="start">%</InputAdornment>,
    }}
    {...props}
    value={inputAmountRaw}
    onChange={(ev) => {
      const val = ev.target.value;
      if (val.match(/^(?:[0-9]{0,2}(?:[.][0-9]{0,1})?|100(:?[.]0?)?)$/)) {
        setInputAmountRaw(ev.target.value);
        if (onChange) {
          onChange(parseFloat(val || '0'));
        }
      }
    }}
  />;
}