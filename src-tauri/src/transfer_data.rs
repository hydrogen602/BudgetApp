use std::{error::Error, fmt, fs::File, path::Path};

use crate::data::{Money, Percentage};
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
pub enum ExpensesJson {
    Expense(String, MoneyJson),
    ExpensePercentage(String, Percentage),
}

#[derive(serde::Deserialize, serde::Serialize, JsonSchema, Debug)]
pub struct IncomeJson(pub MoneyJson);

#[derive(serde::Deserialize, serde::Serialize, JsonSchema, Debug)]
pub struct IncomeAndExpensesJson {
    pub income: Vec<IncomeJson>,
    pub expenses: Vec<ExpensesJson>,
}

impl IncomeAndExpensesJson {
    pub fn save(&self, path: impl AsRef<Path>) -> Result<(), Box<dyn Error>> {
        let f = File::create(&path)?;

        serde_json::to_writer_pretty(f, self)?;

        Ok(())
    }

    pub fn load(path: impl AsRef<Path>) -> Result<Self, Box<dyn Error>> {
        let f = File::open(&path)?;

        let data: Self = serde_json::from_reader(f)?;

        Ok(data)
    }
}
