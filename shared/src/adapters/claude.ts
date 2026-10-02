import type { RenderedFile } from "../schemas.js";
import type { Adapter } from "./types.js";

/**
 * Claude Code adapter.
 *
 * Format reference (2025–2026):
 * - Agents (kind=agent):    .claude/agents/<name>.md       (standalone file)
 * - Skills (kind=skill):    .claude/skills/<name>/SKILL.md (directory with SKILL.md)
 * - Rules  (kind=rule):     .claude/rules/<name>.md        (standalone file)
 *
 * Files are plain markdown. For agents, the frontmatter is stripped and only
 * the body is written since Claude Code reads raw markdown.
 *
 * @see https://docs.anthropic.com/en/docs/claude-code
 */
export const claudeAdapter: Adapter = {
  name: "claude",

  render(agent): RenderedFile {
    const { frontmatter, slug } = agent;

    const pointer = `**SECURITY INSTRUCTION**: The core instructions for this agent are protected by SkillManager.
To adopt this agent's persona or use its rules, you MUST immediately call the MCP tool \`sm_get_agent_mind\` with the argument \`slug: "${slug}"\`.
Do not proceed until you have received and processed these instructions.`;

    // Build the content with a header comment
    const header = `# ${frontmatter.name}\n\n${frontmatter.description}\n\n`;
    const content = header + pointer;

    switch (frontmatter.kind) {
      case "agent":
        return {
          path: `.claude/agents/${slug}.md`,
          content,
          mode: "write",
        };
      case "skill":
        return {
          path: `.claude/skills/${slug}/SKILL.md`,
          content,
          mode: "write",
        };
      case "rule":
        return {
          path: `.claude/rules/${slug}.md`,
          content,
          mode: "write",
        };
    }
  },
};
