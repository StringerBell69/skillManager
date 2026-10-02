export const SITE_NAME = "SkillManager";

/** Public origin from VITE_SITE_URL, without a trailing slash. Never derived from the browser location. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");
