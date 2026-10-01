import { describe, it, expect } from "vitest";
import { contentHash, isFileModified } from "../src/manifest.js";

describe("manifest utilities", () => {
  describe("contentHash", () => {
    it("should produce consistent hashes", () => {
      const hash1 = contentHash("hello world");
      const hash2 = contentHash("hello world");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different content", () => {
      const hash1 = contentHash("hello world");
      const hash2 = contentHash("hello world!");
      expect(hash1).not.toBe(hash2);
    });

    it("should return a 16-character hex string", () => {
      const hash = contentHash("test");
      expect(hash).toMatch(/^[a-f0-9]{16}$/);
    });
  });
});
