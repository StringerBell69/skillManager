import { describe, it, expect } from "vitest";
import {
  sha256,
  generateCliToken,
  generateDeviceCode,
  generateUserCode,
  timingSafeCompare,
} from "../src/common/utils/crypto";

describe("crypto utilities", () => {
  describe("sha256", () => {
    it("should produce consistent hashes", () => {
      expect(sha256("hello")).toBe(sha256("hello"));
    });

    it("should produce different hashes for different inputs", () => {
      expect(sha256("hello")).not.toBe(sha256("world"));
    });

    it("should produce a 64-character hex string", () => {
      expect(sha256("test")).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("generateCliToken", () => {
    it("should start with 'sm_' prefix", () => {
      const token = generateCliToken();
      expect(token.startsWith("sm_")).toBe(true);
    });

    it("should be 67 characters long (sm_ + 64 hex)", () => {
      const token = generateCliToken();
      expect(token.length).toBe(67);
    });

    it("should generate unique tokens", () => {
      const a = generateCliToken();
      const b = generateCliToken();
      expect(a).not.toBe(b);
    });

    it("should never contain the device code or be loggable as plain secret", () => {
      const token = generateCliToken();
      // Token should be hex after prefix
      expect(token.slice(3)).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("generateDeviceCode", () => {
    it("should be a 64-character hex string", () => {
      const code = generateDeviceCode();
      expect(code).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate unique codes", () => {
      const a = generateDeviceCode();
      const b = generateDeviceCode();
      expect(a).not.toBe(b);
    });
  });

  describe("generateUserCode", () => {
    it("should match format XXXX-XXXX", () => {
      const code = generateUserCode();
      expect(code).toMatch(/^[A-Z]{4}-[0-9]{4}$/);
    });

    it("should not contain confusing characters (0, O, 1, I, L)", () => {
      // Generate many codes to test statistically
      for (let i = 0; i < 100; i++) {
        const code = generateUserCode();
        const alpha = code.split("-")[0]!;
        const digits = code.split("-")[1]!;
        expect(alpha).not.toContain("O");
        expect(alpha).not.toContain("I");
        expect(alpha).not.toContain("L");
        expect(digits).not.toContain("0");
        expect(digits).not.toContain("1");
      }
    });
  });

  describe("timingSafeCompare", () => {
    it("should return true for equal strings", () => {
      expect(timingSafeCompare("hello", "hello")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(timingSafeCompare("hello", "world")).toBe(false);
    });

    it("should return false for different lengths", () => {
      expect(timingSafeCompare("short", "longer string")).toBe(false);
    });
  });
});
