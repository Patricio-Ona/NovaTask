import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./components/providers/ThemeProvider";

const routerMode = import.meta.env.VITE_ROUTER_MODE === "hash" ? "hash" : "browser";
const basePath = import.meta.env.VITE_APP_BASE_PATH || "/";
const Router = routerMode === "hash" ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router basename={basePath}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
