.PHONY: run build translate-rust-ts

run:
	npm run tauri dev

# this is on a M1 mac
build:
	npm run tauri build

translate-rust-ts: translate-rust-ts-marker

translate-rust-ts-marker: src-tauri/src/bin/export_schemas.rs src-tauri/src/transfer_data.rs
	cd src-tauri; cargo run --bin export_schemas
	npx json2ts -i 'src-tauri/schemas/**/*.json' --declareExternallyReferenced=0 --output 'src/rust-types'
	touch translate-rust-ts-marker
