use budgeting::{
    self,
    data::Percentage,
    transfer_data::{MoneyJson, UpdateBudgetJson},
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
    schema_for_one::<UpdateBudgetJson>();
    schema_for_one::<Percentage>();
}
