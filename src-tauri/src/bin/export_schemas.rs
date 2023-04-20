use budgeting::{
    self,
    data::Percentage,
    transfer_data::{ExpensesJson, IncomeAndExpensesJson, IncomeJson, MoneyJson, TransactionJson},
    util::type_name_last,
};
use schemars::{schema_for, JsonSchema};

fn schema_for_one<T: JsonSchema>() {
    let schema = schema_for!(T);
    let output = serde_json::to_string_pretty(&schema).unwrap();
    std::fs::write(format!("schemas/{}.json", type_name_last::<T>()), output).unwrap();
}

fn main() {
    schema_for_one::<MoneyJson>();
    schema_for_one::<ExpensesJson>();
    schema_for_one::<IncomeJson>();
    schema_for_one::<IncomeAndExpensesJson>();
    schema_for_one::<Percentage>();
    schema_for_one::<TransactionJson>();
}
