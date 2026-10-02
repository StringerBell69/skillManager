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

// The landing page ships prerendered HTML; every other route renders on the client.
if (container.hasChildNodes() && window.location.pathname === "/") {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
