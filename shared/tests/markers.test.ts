import { describe, it, expect } from "vitest";
import { injectBlock, removeBlock, hasBlock, extractBlock } from "../src/markers.js";

describe("markers", () => {
  const EXISTING = `# My Config

Some existing content here.

More content.
`;

  describe("injectBlock", () => {
    it("should append a new block to existing content", () => {
      const result = injectBlock(EXISTING, "test-agent", "Agent instructions here");

      expect(result).toContain("<!-- skillmanager:start:test-agent -->");
      expect(result).toContain("Agent instructions here");
      expect(result).toContain("<!-- skillmanager:end:test-agent -->");
      expect(result).toContain("Some existing content here.");
    });

    it("should replace an existing block (idempotent)", () => {
      const first = injectBlock(EXISTING, "test-agent", "Version 1");
      const second = injectBlock(first, "test-agent", "Version 2");

      expect(second).toContain("Version 2");
      expect(second).not.toContain("Version 1");
      // Should still have exactly one pair of markers
      expect(second.match(/skillmanager:start:test-agent/g)?.length).toBe(1);
      expect(second.match(/skillmanager:end:test-agent/g)?.length).toBe(1);
    });

    it("should handle multiple different blocks", () => {
      let result = injectBlock(EXISTING, "agent-a", "Content A");
      result = injectBlock(result, "agent-b", "Content B");

      expect(result).toContain("Content A");
      expect(result).toContain("Content B");
      expect(hasBlock(result, "agent-a")).toBe(true);
      expect(hasBlock(result, "agent-b")).toBe(true);
    });

    it("should handle empty file content", () => {
      const result = injectBlock("", "test", "Content");

      expect(result).toContain("<!-- skillmanager:start:test -->");
      expect(result).toContain("Content");
    });
  });

  describe("removeBlock", () => {
    it("should remove an existing block", () => {
      const withBlock = injectBlock(EXISTING, "test-agent", "To be removed");
      const result = removeBlock(withBlock, "test-agent");

      expect(result).not.toContain("skillmanager:start:test-agent");
      expect(result).not.toContain("To be removed");
      expect(result).toContain("Some existing content here.");
    });

    it("should return unchanged content if block not found", () => {
      const result = removeBlock(EXISTING, "nonexistent");
      expect(result.trim()).toBe(EXISTING.trim());
    });

    it("should not affect other blocks", () => {
      let content = injectBlock(EXISTING, "agent-a", "Content A");
      content = injectBlock(content, "agent-b", "Content B");

      const result = removeBlock(content, "agent-a");

      expect(result).not.toContain("Content A");
      expect(result).toContain("Content B");
    });
  });

  describe("hasBlock", () => {
    it("should return true when block exists", () => {
      const content = injectBlock(EXISTING, "test", "Content");
      expect(hasBlock(content, "test")).toBe(true);
    });

    it("should return false when block does not exist", () => {
      expect(hasBlock(EXISTING, "test")).toBe(false);
    });
  });

  describe("extractBlock", () => {
    it("should extract the content of an existing block", () => {
      const content = injectBlock(EXISTING, "test", "Extracted content");
      const extracted = extractBlock(content, "test");
      expect(extracted).toBe("Extracted content");
    });

    it("should return null for non-existent block", () => {
      expect(extractBlock(EXISTING, "nonexistent")).toBeNull();
    });
  });
});
