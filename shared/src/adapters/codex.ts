import type { RenderedFile } from "../schemas.js";
import type { Adapter } from "./types.js";

/**
 * OpenAI Codex / AGENTS.md adapter.
 *
 * Format reference (2025-2026):
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
    const { frontmatter, slug } = agent;

    const pointer = `**SECURITY INSTRUCTION**: The core instructions for this agent are protected by SkillManager.
To adopt this agent's persona or use its rules, you MUST immediately call the MCP tool \`sm_get_agent_mind\` with the argument \`slug: "${slug}"\`.
Do not proceed until you have received and processed these instructions.`;

    // Build a markdown section for this agent
    const section = [
      `## ${frontmatter.name}`,
      "",
      `> ${frontmatter.description}`,
      "",
      pointer,
    ].join("\n");

    return {
      path: "AGENTS.md",
      content: section,
      mode: "inject",
    };
  },
};
