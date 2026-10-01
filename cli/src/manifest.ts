import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { LOCAL_MANIFEST_DIR, LOCAL_MANIFEST_FILE, GLOBAL_MANIFEST_PATH } from "./config.js";

export interface ManifestEntry {
  slug: string;
  version: string;
  files: ManifestFileEntry[];
}

export interface ManifestFileEntry {
  path: string;
  contentHash: string;
  mode: string;
}

export interface Manifest {
  version: number;
  updatedAt: string;
  agents: ManifestEntry[];
}

function emptyManifest(): Manifest {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    agents: [],
  };
}

/**
 * Compute SHA-256 hash of content.
 */
export function contentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Get the manifest path for project or global scope.
 */
function getManifestPath(global: boolean, projectRoot?: string): string {
  if (global) {
    return GLOBAL_MANIFEST_PATH;
  }
  const root = projectRoot || process.cwd();
  return path.join(root, LOCAL_MANIFEST_DIR, LOCAL_MANIFEST_FILE);
}

/**
 * Load the manifest from disk.
 */
export function loadManifest(global: boolean, projectRoot?: string): Manifest {
  const manifestPath = getManifestPath(global, projectRoot);
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return emptyManifest();
  }
}

/**
 * Save the manifest to disk.
 */
export function saveManifest(manifest: Manifest, global: boolean, projectRoot?: string): void {
  const manifestPath = getManifestPath(global, projectRoot);
  const dir = path.dirname(manifestPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Check if a file has been locally modified since installation.
 */
export function isFileModified(filePath: string, expectedHash: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return contentHash(content) !== expectedHash;
  } catch {
    return false; // File doesn't exist = not modified
  }
}
