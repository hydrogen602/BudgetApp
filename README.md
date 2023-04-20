# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Notes on the app

the data as JSON is defined in terms of rust types in `transfer_data.rs`. They then automatically get converted to typescript using `make translate-rust-ts`.

`rust-invoke.ts` has the typescript side of the rust-ts communication.
