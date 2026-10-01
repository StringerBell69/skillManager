import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Generate a SHA-256 hash of a string.
 */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Generate a CLI token: "sm_" + 32 random bytes as hex (64 chars).
 */
export function generateCliToken(): string {
  return `sm_${randomBytes(32).toString("hex")}`;
}

/**
 * Generate a device code: long random secret (never shown to user).
 */
export function generateDeviceCode(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a human-readable user code in format ABCD-1234.
 * Alphabet excludes 0, O, 1, I, L to avoid confusion.
 */
export function generateUserCode(): string {
  const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I, L, O
  const DIGITS = "23456789"; // no 0, 1

  let alpha = "";
  const alphaBytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    alpha += ALPHA[alphaBytes[i]! % ALPHA.length];
  }

  let digits = "";
  const digitBytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    digits += DIGITS[digitBytes[i]! % DIGITS.length];
  }

  return `${alpha}-${digits}`;
}

/**
 * Timing-safe string comparison.
 * Used for comparing API keys, webhook secrets, etc.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}
