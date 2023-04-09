pub fn type_name_last<T>() -> &'static str {
    let raw_type = std::any::type_name::<T>();
    raw_type
        .rsplit_once("::")
        .map(|(_, name)| name)
        .unwrap_or(raw_type)
}
