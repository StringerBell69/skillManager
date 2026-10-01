import type { RenderedFile } from "../schemas.js";
import type { Adapter } from "./types.js";

/**
 * Cursor adapter (.cursor/rules/*.mdc).
 *
 * Format reference (2025–2026):
 * - Location: .cursor/rules/<name>.mdc
 * - Format: YAML frontmatter + Markdown body
 * - Frontmatter fields:
 *   - description: string (concise, <160 chars)
 *   - globs: string[] (optional, file patterns for scoped activation)
 *   - alwaysApply: boolean (if true, always loaded in context)
 *
 * For SkillManager agents:
 * - kind=rule → alwaysApply: true (global rule)
 * - kind=agent/skill → alwaysApply: false (load on demand via description matching)
 *
 * @see https://docs.cursor.com/context/rules
 */
export const cursorAdapter: Adapter = {
  name: "cursor",

  render(agent): RenderedFile {
    const { frontmatter, body } = agent;
    const slug = frontmatter.name.toLowerCase().replace(/\s+/g, "-");

    const alwaysApply = frontmatter.kind === "rule";

    // Build .mdc content with YAML frontmatter
    const lines = [
      "---",
      `description: "${frontmatter.description.slice(0, 160)}"`,
      `alwaysApply: ${alwaysApply}`,
      "---",
      "",
      `# ${frontmatter.name}`,
      "",
      body,
    ];

    return {
      path: `.cursor/rules/${slug}.mdc`,
      content: lines.join("\n"),
      mode: "write",
    };
  },
};
