import type { RenderedFile } from "../schemas.js";
import type { Adapter } from "./types.js";

/**
 * Gemini CLI / GEMINI.md adapter.
 *
 * Format reference (2025–2026):
 * - GEMINI.md at the project root (or ~/.gemini/GEMINI.md for global)
 * - Plain markdown, no special frontmatter
 * - Gemini CLI reads it hierarchically: global → project → subdirectory
 * - Supports @path/to/file.md imports within GEMINI.md
 *
 * Since GEMINI.md is a shared file, we use mode="inject" with markers.
 *
 * @see https://github.com/google-gemini/gemini-cli
 */
export const geminiAdapter: Adapter = {
  name: "gemini",

  render(agent): RenderedFile {
    const { frontmatter, body } = agent;

    // Build a markdown section for this agent
    const section = [
      `## ${frontmatter.name}`,
      "",
      `> ${frontmatter.description}`,
      "",
      body,
    ].join("\n");

    return {
      path: "GEMINI.md",
      content: section,
      mode: "inject",
    };
  },
};
