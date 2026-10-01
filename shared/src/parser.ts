import matter from "gray-matter";
import type { AgentSource, AgentFrontmatter } from "./schemas.js";
import { AgentFrontmatterSchema } from "./schemas.js";

/**
 * Parse a raw .md agent file (frontmatter + body) into an AgentSource.
 * Validates frontmatter against the Zod schema.
 */
export function parseAgentSource(raw: string): AgentSource {
  const { data, content } = matter(raw);
  const frontmatter = AgentFrontmatterSchema.parse(data);
  return { frontmatter, body: content.trim() };
}

/**
 * Serialize an AgentSource back to a .md string with YAML frontmatter.
 */
export function serializeAgentSource(agent: AgentSource): string {
  const fm: Record<string, unknown> = {
    name: agent.frontmatter.name,
    description: agent.frontmatter.description,
    kind: agent.frontmatter.kind,
  };

  if (agent.frontmatter.tools?.length) fm.tools = agent.frontmatter.tools;
  if (agent.frontmatter.model) fm.model = agent.frontmatter.model;
  if (agent.frontmatter.tags?.length) fm.tags = agent.frontmatter.tags;
  if (agent.frontmatter.planRequired && agent.frontmatter.planRequired !== "FREE") {
    fm.planRequired = agent.frontmatter.planRequired;
  }

  return matter.stringify(agent.body + "\n", fm);
}

/**
 * Extract just the frontmatter from a raw .md file without full validation.
 * Useful for quick scanning.
 */
export function extractFrontmatter(raw: string): Record<string, unknown> {
  const { data } = matter(raw);
  return data;
}
