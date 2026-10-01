import fs from "node:fs";
import path from "node:path";
import { injectBlock, removeBlock } from "@skillmanager/shared";
import type { BundleAgentFile } from "@skillmanager/shared";

/**
 * Validate that a file path from the server is safe.
 * Prevents path traversal attacks from a malicious server response.
 */
export function validatePath(filePath: string, rootDir: string): string {
  // Must be relative
  if (path.isAbsolute(filePath)) {
    throw new Error(`Refusing to write absolute path: ${filePath}`);
  }

  // No ".." components
  const normalized = path.normalize(filePath);
  if (normalized.startsWith("..") || normalized.includes(`${path.sep}..`)) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }

  // Resolve to absolute and verify it's under rootDir
  const resolved = path.resolve(rootDir, normalized);
  const resolvedRoot = path.resolve(rootDir);
  if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
    throw new Error(`Path escapes root directory: ${filePath}`);
  }

  return resolved;
}

/**
 * Write a file, creating parent directories as needed.
 * For mode="inject", uses marker-based injection.
 * For mode="write", writes the entire file.
 */
export function writeAgentFile(
  file: BundleAgentFile,
  slug: string,
  rootDir: string,
): void {
  const resolvedPath = validatePath(file.path, rootDir);

  if (file.mode === "inject") {
    // Read existing content or create empty
    let existing = "";
    try {
      existing = fs.readFileSync(resolvedPath, "utf-8");
    } catch {
      // File doesn't exist, will be created
    }

    const injected = injectBlock(existing, slug, file.content);

    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolvedPath, injected);
  } else {
    // mode === "write"
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolvedPath, file.content);
  }
}

/**
 * Remove an agent's files.
 * For inject mode, removes the block from the shared file.
 * For write mode, deletes the file.
 */
export function removeAgentFile(
  filePath: string,
  slug: string,
  mode: string,
  rootDir: string,
): void {
  const resolvedPath = validatePath(filePath, rootDir);

  if (mode === "inject") {
    try {
      const existing = fs.readFileSync(resolvedPath, "utf-8");
      const cleaned = removeBlock(existing, slug);
      fs.writeFileSync(resolvedPath, cleaned);
    } catch {
      // File doesn't exist, nothing to remove
    }
  } else {
    try {
      fs.unlinkSync(resolvedPath);
      // Try to remove empty parent directories
      const dir = path.dirname(resolvedPath);
      try { fs.rmdirSync(dir); } catch { /* not empty, fine */ }
    } catch {
      // File doesn't exist
    }
  }
}
