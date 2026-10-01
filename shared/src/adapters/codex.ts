import type { RenderedFile } from "../schemas.js";
import type { Adapter } from "./types.js";

/**
 * OpenAI Codex / AGENTS.md adapter.
 *
 * Format reference (2025–2026):
 * - AGENTS.md at the project root (or nested for monorepos)
 * - Plain markdown, no special frontmatter required
 * - Codex reads it hierarchically: root → nested directories
 * - We inject each agent as a section between skillmanager markers
 *   for idempotent updates
 *
 * Since AGENTS.md is a shared file, we use mode="inject" with markers.
 *
 * @see https://openai.com/index/codex/
 */
export const codexAdapter: Adapter = {
  name: "codex",

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
      path: "AGENTS.md",
      content: section,
      mode: "inject",
    };
  },
};
