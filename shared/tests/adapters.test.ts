import { describe, it, expect } from "vitest";
import { render, renderAll } from "../src/adapters/index.js";
import type { AgentSource } from "../src/schemas.js";

const AGENT: AgentSource = {
  frontmatter: {
    name: "code-reviewer",
    description: "Reviews code for quality and security issues",
    kind: "agent",
    tools: ["read_file", "grep"],
    tags: ["dev"],
    planRequired: "FREE",
  },
  body: "You are a code review expert.\n\nAnalyze code for bugs and security.",
};

const SKILL: AgentSource = {
  frontmatter: {
    name: "api-design",
    description: "Helps design RESTful APIs",
    kind: "skill",
    planRequired: "PRO",
  },
  body: "Guide the user through API design.\n\n## Steps\n1. Define resources\n2. Define endpoints",
};

const RULE: AgentSource = {
  frontmatter: {
    name: "typescript-style",
    description: "Enforces TypeScript coding standards",
    kind: "rule",
    planRequired: "FREE",
  },
  body: "- Always use `interface` over `type` for objects.\n- Use strict mode.",
};

describe("Claude adapter", () => {
  it("should render an agent to .claude/agents/<slug>.md", () => {
    const result = render(AGENT, "claude");
    expect(result.path).toBe(".claude/agents/code-reviewer.md");
    expect(result.mode).toBe("write");
    expect(result.content).toContain("# code-reviewer");
    expect(result.content).toContain("code review expert");
  });

  it("should render a skill to .claude/skills/<slug>/SKILL.md", () => {
    const result = render(SKILL, "claude");
    expect(result.path).toBe(".claude/skills/api-design/SKILL.md");
    expect(result.mode).toBe("write");
  });

  it("should render a rule to .claude/rules/<slug>.md", () => {
    const result = render(RULE, "claude");
    expect(result.path).toBe(".claude/rules/typescript-style.md");
    expect(result.mode).toBe("write");
  });
});

describe("Codex adapter", () => {
  it("should render to AGENTS.md with inject mode", () => {
    const result = render(AGENT, "codex");
    expect(result.path).toBe("AGENTS.md");
    expect(result.mode).toBe("inject");
    expect(result.content).toContain("## code-reviewer");
    expect(result.content).toContain("> Reviews code for quality");
  });
});

describe("Cursor adapter", () => {
  it("should render a rule as .mdc with alwaysApply: true", () => {
    const result = render(RULE, "cursor");
    expect(result.path).toBe(".cursor/rules/typescript-style.mdc");
    expect(result.mode).toBe("write");
    expect(result.content).toContain("alwaysApply: true");
    expect(result.content).toContain("description:");
  });

  it("should render an agent as .mdc with alwaysApply: false", () => {
    const result = render(AGENT, "cursor");
    expect(result.path).toBe(".cursor/rules/code-reviewer.mdc");
    expect(result.content).toContain("alwaysApply: false");
  });
});

describe("Gemini adapter", () => {
  it("should render to GEMINI.md with inject mode", () => {
    const result = render(AGENT, "gemini");
    expect(result.path).toBe("GEMINI.md");
    expect(result.mode).toBe("inject");
    expect(result.content).toContain("## code-reviewer");
  });
});

describe("renderAll", () => {
  it("should render for multiple targets", () => {
    const results = renderAll(AGENT, ["claude", "codex", "cursor", "gemini"]);
    expect(results).toHaveLength(4);
    expect(results.map((r) => r.path)).toEqual([
      ".claude/agents/code-reviewer.md",
      "AGENTS.md",
      ".cursor/rules/code-reviewer.mdc",
      "GEMINI.md",
    ]);
  });
});
