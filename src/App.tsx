import "./App.css";
import BudgetEstimate from "./pages/BudgetEstimate/BudgetEstimate";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Alert, Snackbar } from "@mui/material";

import 'chart.js/auto';
import { createContext, useState } from "react";
// import { useState } from "react";
// import { useTauriState } from "./tauriStore";
// import { useEffect } from "react";
// import { invoke } from "@tauri-apps/api";

export interface SnackbarMessage {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

export const SnackbarContext = createContext<(_: SnackbarMessage) => void>((_) => { });


function App() {
  const [msg, setMsg] = useState<null | SnackbarMessage>(null);

  return (
    <SnackbarContext.Provider value={setMsg}>
      <div className="app">
        <BudgetEstimate />
      </div>
      <Snackbar open={Boolean(msg)} autoHideDuration={6000} onClose={() => setMsg(null)}>
        <Alert onClose={() => setMsg(null)} severity={msg?.severity} sx={{ width: '100%' }}>
          {msg?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>

  );
}

export default App;
