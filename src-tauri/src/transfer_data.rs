use std::fmt;

use crate::data::Money;
use rusty_money::iso;
use schemars::JsonSchema;

#[derive(serde::Deserialize, serde::Serialize, JsonSchema, Debug)]
pub struct MoneyJson {
    amount: i32,
    currency: String,
    precision: u8,
}

impl Default for MoneyJson {
    fn default() -> Self {
        Self {
            amount: 0,
            currency: "USD".to_string(),
            precision: 2,
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, JsonSchema, Debug)]
pub struct CurrencyNotFoundError(pub String);

impl TryFrom<MoneyJson> for Money {
    type Error = CurrencyNotFoundError;

    fn try_from(mj: MoneyJson) -> Result<Self, Self::Error> {
        let currency = iso::find(mj.currency.as_str()).ok_or(CurrencyNotFoundError(mj.currency))?;
        Ok(Money::from_minor(mj.amount.into(), currency))
    }
}

impl fmt::Display for CurrencyNotFoundError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Currency not found: {}", self.0)
    }
}

#[derive(serde::Deserialize, serde::Serialize, JsonSchema, Debug)]
pub enum UpdateBudgetJson {
    Income(MoneyJson),
    Expense(String, MoneyJson),
}
