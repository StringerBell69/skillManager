import { describe, it, expect } from "vitest";
import { parseAgentSource, serializeAgentSource } from "../src/parser.js";

const SAMPLE_AGENT = `---
name: code-reviewer
description: Reviews code for quality and security
kind: agent
tools:
  - read_file
  - grep
tags:
  - dev
  - quality
---

# Code Reviewer

You are a code review expert. Analyze the provided code for:
- Security vulnerabilities
- Performance issues
- Code style violations
`;

const SAMPLE_SKILL = `---
name: api-design
description: Helps design RESTful APIs
kind: skill
model: claude-3-opus
planRequired: PRO
---

# API Design Skill

Guide the user through designing a RESTful API.
`;

describe("parseAgentSource", () => {
  it("should parse a valid agent file", () => {
    const result = parseAgentSource(SAMPLE_AGENT);

    expect(result.frontmatter.name).toBe("code-reviewer");
    expect(result.frontmatter.description).toBe("Reviews code for quality and security");
    expect(result.frontmatter.kind).toBe("agent");
    expect(result.frontmatter.tools).toEqual(["read_file", "grep"]);
    expect(result.frontmatter.tags).toEqual(["dev", "quality"]);
    expect(result.frontmatter.planRequired).toBe("FREE");
    expect(result.body).toContain("# Code Reviewer");
  });

  it("should parse a skill with planRequired", () => {
    const result = parseAgentSource(SAMPLE_SKILL);

    expect(result.frontmatter.kind).toBe("skill");
    expect(result.frontmatter.model).toBe("claude-3-opus");
    expect(result.frontmatter.planRequired).toBe("PRO");
  });

  it("should throw on missing required fields", () => {
    const invalid = `---
name: test
---

Body content
`;
    expect(() => parseAgentSource(invalid)).toThrow();
  });

  it("should throw on invalid kind", () => {
    const invalid = `---
name: test
description: Test
kind: invalid
---

Body
`;
    expect(() => parseAgentSource(invalid)).toThrow();
  });
});

describe("serializeAgentSource", () => {
  it("should round-trip a parsed agent", () => {
    const parsed = parseAgentSource(SAMPLE_AGENT);
    const serialized = serializeAgentSource(parsed);
    const reparsed = parseAgentSource(serialized);

    expect(reparsed.frontmatter.name).toBe(parsed.frontmatter.name);
    expect(reparsed.frontmatter.kind).toBe(parsed.frontmatter.kind);
    expect(reparsed.frontmatter.tools).toEqual(parsed.frontmatter.tools);
    expect(reparsed.body).toContain("Code Reviewer");
  });

  it("should omit optional fields when absent", () => {
    const source = {
      frontmatter: {
        name: "test",
        description: "A test",
        kind: "rule" as const,
        planRequired: "FREE" as const,
      },
      body: "Test body",
    };
    const serialized = serializeAgentSource(source);

    expect(serialized).not.toContain("tools:");
    expect(serialized).not.toContain("model:");
    expect(serialized).not.toContain("planRequired:");
  });

  it("should include planRequired when not FREE", () => {
    const source = {
      frontmatter: {
        name: "test",
        description: "A test",
        kind: "agent" as const,
        planRequired: "PRO" as const,
      },
      body: "Body",
    };
    const serialized = serializeAgentSource(source);
    expect(serialized).toContain("planRequired: PRO");
  });
});
