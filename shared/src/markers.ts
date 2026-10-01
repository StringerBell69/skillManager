/**
 * Marker-based injection for shared files (AGENTS.md, GEMINI.md).
 *
 * Injects content between markers:
 *   <!-- skillmanager:start:<name> -->
 *   ... content ...
 *   <!-- skillmanager:end:<name> -->
 *
 * Idempotent: calling inject twice replaces the previous block.
 * Never touches content outside the markers.
 */

const START_MARKER = (name: string) => `<!-- skillmanager:start:${name} -->`;
const END_MARKER = (name: string) => `<!-- skillmanager:end:${name} -->`;

/**
 * Inject (or replace) a named block into a file's content.
 * If the markers already exist, the content between them is replaced.
 * Otherwise, the block is appended at the end.
 */
export function injectBlock(
  fileContent: string,
  name: string,
  blockContent: string,
): string {
  const start = START_MARKER(name);
  const end = END_MARKER(name);
  const fullBlock = `${start}\n${blockContent}\n${end}`;

  const startIdx = fileContent.indexOf(start);
  const endIdx = fileContent.indexOf(end);

  if (startIdx !== -1 && endIdx !== -1) {
    // Replace existing block
    return (
      fileContent.slice(0, startIdx) +
      fullBlock +
      fileContent.slice(endIdx + end.length)
    );
  }

  // Append new block
  const separator = fileContent.length > 0 && !fileContent.endsWith("\n") ? "\n\n" : "\n";
  return fileContent + separator + fullBlock + "\n";
}

/**
 * Remove a named block from a file's content.
 * If the markers don't exist, returns the content unchanged.
 */
export function removeBlock(fileContent: string, name: string): string {
  const start = START_MARKER(name);
  const end = END_MARKER(name);

  const startIdx = fileContent.indexOf(start);
  const endIdx = fileContent.indexOf(end);

  if (startIdx === -1 || endIdx === -1) {
    return fileContent;
  }

  const before = fileContent.slice(0, startIdx);
  const after = fileContent.slice(endIdx + end.length);

  // Clean up extra blank lines
  const result = (before + after).replace(/\n{3,}/g, "\n\n").trim();
  return result.length > 0 ? result + "\n" : "";
}

/**
 * Check if a named block exists in the content.
 */
export function hasBlock(fileContent: string, name: string): boolean {
  return (
    fileContent.includes(START_MARKER(name)) &&
    fileContent.includes(END_MARKER(name))
  );
}

/**
 * Extract the content of a named block (without markers).
 */
export function extractBlock(fileContent: string, name: string): string | null {
  const start = START_MARKER(name);
  const end = END_MARKER(name);

  const startIdx = fileContent.indexOf(start);
  const endIdx = fileContent.indexOf(end);

  if (startIdx === -1 || endIdx === -1) return null;

  const contentStart = startIdx + start.length;
  return fileContent.slice(contentStart, endIdx).trim();
}
