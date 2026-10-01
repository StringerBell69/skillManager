import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import envPaths from "env-paths";

const paths = envPaths("skillmanager", { suffix: "" });

/** Directory for global config: ~/.config/skillmanager/ */
export const CONFIG_DIR = paths.config;

/** Path to the stored CLI token */
export const TOKEN_PATH = path.join(CONFIG_DIR, "token");

/** Path to the global manifest */
export const GLOBAL_MANIFEST_PATH = path.join(CONFIG_DIR, "manifest.json");

/** Project-local manifest path */
export const LOCAL_MANIFEST_DIR = ".skillmanager";
export const LOCAL_MANIFEST_FILE = "manifest.json";

/** API URL */
export const API_URL =
  process.env.SKILLMANAGER_API_URL || "http://127.0.0.1:4000";

/**
 * Ensure the config directory exists with proper permissions (700).
 */
export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Save the CLI token to disk with restricted permissions (600).
 */
export function saveToken(token: string): void {
  ensureConfigDir();
  fs.writeFileSync(TOKEN_PATH, token, { mode: 0o600 });
}

/**
 * Load the saved CLI token, or null if not logged in.
 */
export function loadToken(): string | null {
  try {
    return fs.readFileSync(TOKEN_PATH, "utf-8").trim();
  } catch {
    return null;
  }
}

/**
 * Delete the saved CLI token.
 */
export function deleteToken(): void {
  try {
    fs.unlinkSync(TOKEN_PATH);
  } catch {
    // Token file might not exist
  }
}

/**
 * Check if we're in interactive mode.
 */
export function isInteractive(): boolean {
  return Boolean(process.stdout.isTTY);
}

/**
 * Get the hostname for device identification.
 */
export function getHostname(): string {
  return os.hostname();
}
