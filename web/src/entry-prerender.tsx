import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

/** Build-time render of a public route. Used by scripts/prerender.mjs. */
export async function render(url: string) {
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
  const html = await new Response(prelude).text();
  // For a partial tree React emits hoisted <title>/<meta>/<link> first; move them into <head>.
  const head = html.match(/^(?:<(?:title|meta|link)\b[^>]*>(?:[^<]*<\/title>)?)*/)?.[0] ?? "";
  return { head, body: html.slice(head.length) };
}
