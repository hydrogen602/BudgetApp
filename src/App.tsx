import "./App.css";
import BudgetEstimate from "./pages/BudgetEstimate";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import 'chart.js/auto';
// import { useState } from "react";
// import { useTauriState } from "./tauriStore";
// import { useEffect } from "react";
// import { invoke } from "@tauri-apps/api";



function App() {

  return (
    <div className="app">
      <BudgetEstimate />
    </div>
  );
}

export default App;
