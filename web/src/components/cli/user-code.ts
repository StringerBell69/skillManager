/**
 * The one-time code `sm login` prints, e.g. KPTW-4827. Letters skip I, L, and O
 * and digits skip 0 and 1, so the code cannot be misread.
 */
const USER_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[2-9]{4}$/;

/** Trims and upper-cases the `code` query parameter. Returns "" when it is absent. */
export function normalizeUserCode(raw: string | null): string {
  return raw?.trim().toUpperCase() ?? "";
}

export function isValidUserCode(code: string): boolean {
  return USER_CODE_PATTERN.test(code);
}

/** "KPTW-4827" becomes "K P T W, 4 8 2 7" so screen readers read it character by character. */
export function spellUserCode(code: string): string {
  return code
    .split("-")
    .map((part) => part.split("").join(" "))
    .join(", ");
}

/** Path back to this page with the code kept, used after sign-in, sign-out, and revoking a device. */
export function cliPath(code: string): string {
  return `/cli?code=${encodeURIComponent(code)}`;
}
