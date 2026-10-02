import { isKnownKind, type KnownKind } from "./kinds";

export interface InstallTarget {
  tool: string;
  path: string;
  /** "file": the item gets its own file. "section": a marked block inside a shared file. */
  mode: "file" | "section";
}

const CLAUDE_PATHS: Record<KnownKind, (slug: string) => string> = {
  agent: (slug) => `.claude/agents/${slug}.md`,
  skill: (slug) => `.claude/skills/${slug}/SKILL.md`,
  rule: (slug) => `.claude/rules/${slug}.md`,
};

/** Mirrors shared/src/adapters: where `sm install` writes an item for each tool. */
export function installTargets(kind: string, slug: string): InstallTarget[] {
  const targets: InstallTarget[] = [];
  if (isKnownKind(kind)) targets.push({ tool: "Claude Code", path: CLAUDE_PATHS[kind](slug), mode: "file" });
  targets.push(
    { tool: "Codex", path: "AGENTS.md", mode: "section" },
    { tool: "Cursor", path: `.cursor/rules/${slug}.mdc`, mode: "file" },
    { tool: "Gemini CLI", path: "GEMINI.md", mode: "section" },
  );
  return targets;
}
