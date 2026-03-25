import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./Router";
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
        <AppRoutes prerenderData={window.__PRERENDER_DATA__} />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
