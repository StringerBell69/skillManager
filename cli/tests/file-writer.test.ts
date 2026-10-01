import { describe, it, expect } from "vitest";
import { validatePath } from "../src/file-writer.js";
import path from "node:path";

describe("validatePath", () => {
  const rootDir = "/home/user/project";

  it("should accept a valid relative path", () => {
    const result = validatePath(".claude/agents/test.md", rootDir);
    expect(result).toBe(path.resolve(rootDir, ".claude/agents/test.md"));
  });

  it("should accept AGENTS.md in root", () => {
    const result = validatePath("AGENTS.md", rootDir);
    expect(result).toBe(path.resolve(rootDir, "AGENTS.md"));
  });

  it("should accept nested relative paths", () => {
    const result = validatePath(".cursor/rules/my-rule.mdc", rootDir);
    expect(result).toBe(path.resolve(rootDir, ".cursor/rules/my-rule.mdc"));
  });

  it("should reject absolute paths", () => {
    expect(() => validatePath("/etc/passwd", rootDir)).toThrow("absolute path");
  });

  it("should reject path traversal with ..", () => {
    expect(() => validatePath("../../../etc/passwd", rootDir)).toThrow("traversal");
  });

  it("should reject sneaky path traversal", () => {
    expect(() => validatePath(".claude/../../etc/passwd", rootDir)).toThrow();
  });

  it("should reject hidden traversal with normalized paths", () => {
    expect(() => validatePath("foo/bar/../../../etc/shadow", rootDir)).toThrow();
  });
});
