import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import "./fonts.css";
import "./index.css";

const app = (
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);

const container = document.getElementById("root")!;

// Public pages ship prerendered HTML; every other route renders on the client.
const PRERENDERED = new Set(["/", "/pricing"]);
const path = window.location.pathname.replace(/(.)\/+$/, "$1");

if (container.hasChildNodes() && PRERENDERED.has(path)) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
