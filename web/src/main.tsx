import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import { initPostHog, posthog } from "@/lib/posthog";
import AppRoutes from "./AppRoutes";
import "./fonts.css";
import "./index.css";

initPostHog();

const app = (
  <StrictMode>
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>
);

const container = document.getElementById("root")!;

// Public pages ship prerendered HTML stamped with their route. Hydrate only when the
// stamp matches this URL; a host that serves the wrong file just gets a fresh render.
const path = window.location.pathname.replace(/(.)\/+$/, "$1");

if (container.hasChildNodes() && container.dataset.route === path) {
  hydrateRoot(container, app);
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
