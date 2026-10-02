import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
