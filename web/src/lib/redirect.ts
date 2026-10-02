const FALLBACK = "/dashboard";

/**
 * Turns a `redirect_url` query value (relative or absolute) into a same-origin
 * path. Anything pointing at another origin falls back to the dashboard.
 */
export function safeRedirectPath(value: string | null, origin: string = window.location.origin): string {
  if (!value) return FALLBACK;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return FALLBACK;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("/login") || path.startsWith("/signup") ? FALLBACK : path;
  } catch {
    return FALLBACK;
  }
}
