import { describe, it, expect } from "vitest";
import { applyWatermark, hasWatermark, stripWatermarkComment } from "../src/watermark.js";

describe("watermark", () => {
  const CONTENT = `# My Agent

You are a helpful coding assistant.

## Instructions
- Write clean code
- Follow best practices
`;

  describe("applyWatermark", () => {
    it("should add a watermark comment", () => {
      const result = applyWatermark(CONTENT, "user-123");
      expect(result).toContain("<!-- sm:");
      expect(result).toContain("-->");
    });

    it("should be deterministic (same seed → same output)", () => {
      const a = applyWatermark(CONTENT, "user-123");
      const b = applyWatermark(CONTENT, "user-123");
      expect(a).toBe(b);
    });

    it("should produce different output for different seeds", () => {
      const a = applyWatermark(CONTENT, "user-123");
      const b = applyWatermark(CONTENT, "user-456");
      expect(a).not.toBe(b);
    });

    it("should not alter visible content", () => {
      const result = applyWatermark(CONTENT, "user-123");
      // Strip zero-width chars and comment for comparison
      const stripped = result
        .replace(/[\u200B\u200C\u200D]/g, "")
        .replace(/\n<!-- sm:[a-f0-9]{12} -->/g, "");
      expect(stripped).toBe(CONTENT);
    });

    it("should contain the original content", () => {
      const result = applyWatermark(CONTENT, "user-123");
      expect(result).toContain("# My Agent");
      expect(result).toContain("Write clean code");
    });
  });

  describe("hasWatermark", () => {
    it("should detect watermark for correct seed", () => {
      const watermarked = applyWatermark(CONTENT, "user-123");
      expect(hasWatermark(watermarked, "user-123")).toBe(true);
    });

    it("should not detect watermark for wrong seed", () => {
      const watermarked = applyWatermark(CONTENT, "user-123");
      expect(hasWatermark(watermarked, "user-456")).toBe(false);
    });

    it("should not detect watermark on clean content", () => {
      expect(hasWatermark(CONTENT, "user-123")).toBe(false);
    });
  });

  describe("stripWatermarkComment", () => {
    it("should remove the watermark comment", () => {
      const watermarked = applyWatermark(CONTENT, "user-123");
      const stripped = stripWatermarkComment(watermarked);
      expect(stripped).not.toContain("<!-- sm:");
    });
  });
});
