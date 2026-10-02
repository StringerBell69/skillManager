// Prerenders public routes into static HTML after `vite build`.
// Writes dist/index.html (landing), dist/app.html (shell for signed-in routes),
// dist/404.html, robots.txt, and sitemap.xml.
import fs from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const env = { ...loadEnv("production", root, "VITE_"), ...process.env };
const SITE = (env.VITE_SITE_URL ?? "").replace(/\/+$/, "");

if (!/^https?:\/\/[^/]+$/.test(SITE)) {
  throw new Error("VITE_SITE_URL must be set to the public origin, e.g. https://skillmanager.dev");
}

// Keep in sync with PRERENDERED in src/main.tsx.
const PUBLIC_ROUTES = ["/", "/pricing"];
const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
const { render } = await import(path.join(ssrDir, "entry-prerender.js"));

const shellHead = '<title>SkillManager</title>\n    <meta name="robots" content="noindex, nofollow" />';
const shell = template.replace("<!--app-head-->", shellHead);
await fs.writeFile(path.join(dist, "app.html"), shell);
await fs.writeFile(path.join(dist, "404.html"), shell);

for (const route of PUBLIC_ROUTES) {
  const { head, body } = await render(route);
  if (!head.includes("<title>") || !head.includes('rel="canonical"')) {
    throw new Error(`${route}: the page must render <Seo> with a title and canonical path`);
  }
  const html = template
    .replace("<!--app-head-->", head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const file = route === "/" ? "index.html" : path.join(route.slice(1), "index.html");
  await fs.mkdir(path.dirname(path.join(dist, file)), { recursive: true });
  await fs.writeFile(path.join(dist, file), html);
  console.log(`prerendered ${route}`);
}

await fs.writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
const urls = PUBLIC_ROUTES.map((route) => `  <url><loc>${SITE}${route}</loc></url>`).join("\n");
await fs.writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
await fs.rm(ssrDir, { recursive: true, force: true });
