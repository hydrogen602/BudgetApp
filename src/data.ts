import { Dinero } from "dinero.js";

export class FixedExpense {
  amount: Dinero

  constructor(amount: Dinero) {
    this.amount = amount;
  }

  getAmount(totalAmount: Dinero): Dinero {
    return this.amount;
  }
}

export class PercentExpense {
  percentage: number

  constructor(percentage: number) {
    this.percentage = percentage;
  }

  getAmount(totalAmount: Dinero): Dinero {
    return totalAmount.multiply(this.percentage / 100);
  }
}