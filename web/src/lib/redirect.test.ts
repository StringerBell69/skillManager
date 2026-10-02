import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

const ORIGIN = "https://skillmanager.dev";

describe("safeRedirectPath", () => {
  it("keeps same-origin paths, including the CLI code", () => {
    expect(safeRedirectPath("/cli?code=KPTW-4827", ORIGIN)).toBe("/cli?code=KPTW-4827");
    expect(safeRedirectPath("https://skillmanager.dev/devices", ORIGIN)).toBe("/devices");
  });

  it("rejects other origins and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://evil.example/steal", ORIGIN)).toBe("/dashboard");
    expect(safeRedirectPath("//evil.example/steal", ORIGIN)).toBe("/dashboard");
    expect(safeRedirectPath("javascript:alert(1)", ORIGIN)).toBe("/dashboard");
  });

  it("falls back when missing or pointing at the auth pages", () => {
    expect(safeRedirectPath(null, ORIGIN)).toBe("/dashboard");
    expect(safeRedirectPath("/login/factor-one", ORIGIN)).toBe("/dashboard");
  });
});
