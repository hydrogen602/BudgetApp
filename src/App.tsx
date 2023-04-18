import "./App.css";
import BudgetEstimate from "./pages/BudgetEstimate/BudgetEstimate";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Alert, Snackbar } from "@mui/material";

import 'chart.js/auto';
import { createContext, useState } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";
import Records from "./pages/Records";


export interface SnackbarMessage {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

export const SnackbarContext = createContext<(_: SnackbarMessage) => void>((_) => { });
export const BottomNavContext = createContext<[number, (_: number) => void]>([0, (_: number) => { }]);

const router = createMemoryRouter([
  {
    path: '/',
    element: <BudgetEstimate />
  },
  {
    path: '/records',
    element: <Records />
  }
]);

function App() {
  const [msg, setMsg] = useState<null | SnackbarMessage>(null);

  const [value, setValue] = useState(0);

  return (
    <SnackbarContext.Provider value={setMsg}>
      <BottomNavContext.Provider value={[value, setValue]}>
        <div className="app">
          <RouterProvider router={router} />
        </div>
        <Snackbar open={Boolean(msg)} autoHideDuration={6000} onClose={() => setMsg(null)}>
          <Alert onClose={() => setMsg(null)} severity={msg?.severity} sx={{ width: '100%' }}>
            {msg?.message}
          </Alert>
        </Snackbar>
      </BottomNavContext.Provider>
    </SnackbarContext.Provider>

  );
}

export default App;
