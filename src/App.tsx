import "./App.css";
import BudgetEstimate from "./pages/BudgetEstimate";

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

export const SnackbarContext = createContext<(_: string) => void>((_) => { });


function App() {
  const [error, setError] = useState<null | string>(null);

  return (
    <SnackbarContext.Provider value={setError}>
      <div className="app">
        <BudgetEstimate />
      </div>
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>

  );
}

export default App;
