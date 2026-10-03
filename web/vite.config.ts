import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const root = import.meta.dirname;
const reactPkg = path.resolve(root, "node_modules/react");
const reactDomPkg = path.resolve(root, "node_modules/react-dom");

/** Canonical URLs, Open Graph tags, and the sitemap all need the real public origin. */
function requireSiteUrl(): Plugin {
  return {
    name: "skillmanager:require-site-url",
    apply: "build",
    configResolved(config) {
      if (config.build.ssr) return;
      const url = config.env.VITE_SITE_URL ?? "";
      if (!/^https?:\/\/[^/]+$/.test(url)) {
        throw new Error(
          "VITE_SITE_URL must be the public origin without a trailing slash, e.g. https://skillmanager.dev (see web/.env.example).",
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), requireSiteUrl()],
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
      // Workspace hoist can put a second React at the monorepo root; pin one copy.
      react: reactPkg,
      "react-dom": reactDomPkg,
      "react/jsx-runtime": path.resolve(reactPkg, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(reactPkg, "jsx-dev-runtime.js"),
    },
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
  },
  // Bundle the router into the prerender entry so it shares the same React instance.
  ssr: {
    noExternal: ["react-router", "react-router-dom"],
  },
});
