// use rust_decimal::Decimal;
use rusty_money::{iso, iso::Currency, Money as rs_Money};
use serde::{Deserialize, Serialize};
// use serde::ser::SerializeMap;
// use serde::{Deserialize, Serialize, Serializer};
use std::error::Error;
use std::{collections::HashMap, fs::File, path::Path, sync::Mutex};

pub type Money = rs_Money<'static, Currency>;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(bound = "S: helper_types::MoneyTypeHelperSealed")]
pub struct IncomeAndExpensesRaw<S: helper_types::MoneyTypeSealed> {
    pub income: S,
    pub expenses: HashMap<String, S>,
}

/// This is the type that should be used for actual state
/// The generic stuff is just to deal with serialization
pub type IncomeAndExpenses = IncomeAndExpensesRaw<Money>;

impl Default for IncomeAndExpenses {
    fn default() -> Self {
        Self {
            income: Money::from_minor(0, iso::USD),
            expenses: HashMap::new(),
        }
    }
}

impl helper_types::MoneyTypeSealed for Money {}
impl helper_types::MoneyTypeSealed for helper_types::MoneySerializeHelper {}
impl helper_types::MoneyTypeHelperSealed for helper_types::MoneySerializeHelper {}

mod helper_types {
    pub trait MoneyTypeSealed {}
    pub trait MoneyTypeHelperSealed: Serialize + DeserializeOwned {}

    impl From<IncomeAndExpensesRaw<Money>> for IncomeAndExpensesRaw<MoneySerializeHelper> {
        fn from(raw: IncomeAndExpensesRaw<Money>) -> IncomeAndExpensesRaw<MoneySerializeHelper> {
            IncomeAndExpensesRaw {
                income: raw.income.into(),
                expenses: raw
                    .expenses
                    .into_iter()
                    .map(|(k, v)| (k, v.into()))
                    .collect(),
            }
        }
    }

    impl TryFrom<IncomeAndExpensesRaw<MoneySerializeHelper>> for IncomeAndExpensesRaw<Money> {
        type Error = CurrencyNotFoundError;

        fn try_from(
            raw: IncomeAndExpensesRaw<MoneySerializeHelper>,
        ) -> Result<IncomeAndExpensesRaw<Money>, Self::Error> {
            let income = raw.income.try_into()?;

            let expenses: HashMap<_, _> = raw
                .expenses
                .into_iter()
                .map(|(k, v)| Ok((k, v.try_into()?)))
                .collect::<Result<_, Self::Error>>()?;

            Ok(IncomeAndExpensesRaw { income, expenses })
        }
    }

    use std::collections::HashMap;

    use rust_decimal::Decimal;
    use serde::{de::DeserializeOwned, Deserialize, Serialize};

    use crate::transfer_data::CurrencyNotFoundError;

    use super::{IncomeAndExpensesRaw, Money};

    #[derive(Debug, Clone, Deserialize, Serialize)]
    pub struct MoneySerializeHelper {
        pub amount: Decimal,
        pub currency: String,
    }

    impl From<Money> for MoneySerializeHelper {
        fn from(money: Money) -> Self {
            Self {
                amount: *money.amount(),
                currency: money.currency().to_string(),
            }
        }
    }

    impl TryFrom<MoneySerializeHelper> for Money {
        type Error = CurrencyNotFoundError;

        fn try_from(money: MoneySerializeHelper) -> Result<Self, Self::Error> {
            let currency = rusty_money::iso::find(money.currency.as_str())
                .ok_or(CurrencyNotFoundError(money.currency))?;
            Ok(Money::from_decimal(money.amount, currency))
        }
    }
}

impl Serialize for IncomeAndExpenses {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let helper: IncomeAndExpensesRaw<helper_types::MoneySerializeHelper> = self.clone().into();
        helper.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for IncomeAndExpenses {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let helper: IncomeAndExpensesRaw<helper_types::MoneySerializeHelper> =
            serde::Deserialize::deserialize(deserializer)?;
        helper.try_into().map_err(serde::de::Error::custom)
    }
}

// impl Serialize for IncomeAndExpenses {
//     fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
//     where
//         S: Serializer,
//     {
//         let mut map = serializer.serialize_map(Some(2))?;
//         map.serialize_entry("income", &MoneySerializeHelper::from(self.income.clone()))?;

//         let expenses: HashMap<_, _> = self
//             .expenses
//             .iter()
//             .map(|(k, v)| (k, MoneySerializeHelper::from(v.clone())))
//             .collect();

//         map.serialize_entry("expenses", &expenses)?;
//         map.end()
//     }
// }

// impl<'de> Deserialize<'de> for IncomeAndExpenses {
//     fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
//     where
//         D: serde::Deserializer<'de>,
//     {
//         serde::Deserialize::deserialize(deserializer)
//         // let helper = MoneySerializeHelper::deserialize(deserializer)?;

//         // let income = Money::try_from(helper.income).unwrap();

//         // let expenses: HashMap<_, _> = helper
//         //     .expenses
//         //     .iter()
//         //     .map(|(k, v)| (k.clone(), Money::try_from(v.clone()).unwrap()))
//         //     .collect();

//         // Ok(Self { income, expenses })
//         panic!()
//     }
// }

pub struct MyState(pub Mutex<IncomeAndExpenses>);
impl Default for MyState {
    fn default() -> Self {
        Self(Mutex::new(IncomeAndExpenses::default()))
    }
}

impl MyState {
    pub fn new(i: IncomeAndExpenses) -> Self {
        Self(Mutex::new(i))
    }

    pub fn save(&self, path: impl AsRef<Path>) -> Result<(), Box<dyn Error>> {
        let locked_state = self.0.lock().unwrap();

        let f = File::create(&path)?;

        serde_json::to_writer_pretty(f, &*locked_state)?;

        Ok(())
    }

    pub fn load(&self, path: impl AsRef<Path>) -> Result<(), Box<dyn Error>> {
        let f = File::open(&path)?;

        let state: IncomeAndExpenses = serde_json::from_reader(f)?;
        *self.0.lock().unwrap() = state;

        Ok(())
    }
}
