import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./Router";
import { AuthProvider } from "./lib/authContext";
import "./index.css";

declare global {
  interface Window {
    __PRERENDER_DATA__?: any;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes prerenderData={window.__PRERENDER_DATA__} />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
