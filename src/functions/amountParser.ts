import dayjs, { Dayjs } from "dayjs";
import { Dinero } from "dinero.js";
import DineroBuilder from "dinero.js";

export function parseDate(dateStr: string): Dayjs {
  // TODO: pick date format
  const date = dayjs(dateStr, 'MM/DD/YYYY', true);
  if (!date.isValid()) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

export function parseAmount(amountStr: string): Dinero {
  amountStr = amountStr.trim();
  const regMatch = amountStr.match(/^(-|\+)?([0-9]*)(?:[.]([0-9]*))?$/);
  if (!regMatch) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  const [_, signStr, dollarsStr, centsStr] = regMatch;


  let sign = 1;
  if (signStr === "-") {
    sign = -1;
  } else if (signStr === "+") {
    sign = 1;
  } else if (signStr === undefined) {
    sign = 1;
  } else {
    throw new Error(`Invalid amount: ${amountStr}`);
  }

  const dollars = parseInt(dollarsStr || '0');
  const cents = parseInt(centsStr || '0');

  if (Number.isNaN(dollars) || Number.isNaN(cents)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }

  const PRECISION = 2;
  const CURRENCY = "USD";

  if (Math.log10(cents) >= PRECISION) {
    throw new Error(`Invalid amount (cents has too much precision): ${amountStr} where cents=${cents}`);
  }

  const amount = sign * (dollars * (10 ** PRECISION) + cents);

  return DineroBuilder({ amount, currency: CURRENCY, precision: PRECISION });
}
