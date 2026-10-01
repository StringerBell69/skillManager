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
    const { frontmatter, body } = agent;
    const slug = frontmatter.name.toLowerCase().replace(/\s+/g, "-");

    // Build the content with a header comment
    const header = `# ${frontmatter.name}\n\n${frontmatter.description}\n\n`;
    const content = header + body;

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
