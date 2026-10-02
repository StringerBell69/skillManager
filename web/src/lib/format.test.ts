import { describe, expect, it } from "vitest";
import { formatDate, formatRelative, planLabel, pluralize } from "./format";

const NOW = Date.parse("2026-10-02T12:00:00Z");

describe("formatRelative", () => {
  it("handles missing and invalid values", () => {
    expect(formatRelative(null, NOW)).toBe("Never");
    expect(formatRelative("not a date", NOW)).toBe("Never");
  });

  it("uses 'just now' under a minute", () => {
    expect(formatRelative(new Date(NOW - 20_000), NOW)).toBe("just now");
  });

  it("picks the largest whole unit", () => {
    expect(formatRelative(new Date(NOW - 3 * 60_000), NOW)).toBe("3 minutes ago");
    expect(formatRelative(new Date(NOW - 2 * 3_600_000), NOW)).toBe("2 hours ago");
    expect(formatRelative(new Date(NOW - 86_400_000), NOW)).toBe("yesterday");
    expect(formatRelative(new Date(NOW + 3 * 86_400_000), NOW)).toBe("in 3 days");
  });
});

describe("formatDate", () => {
  it("formats ISO strings and falls back for missing values", () => {
    expect(formatDate("2026-10-02T12:00:00Z")).toBe("Oct 2, 2026");
    expect(formatDate(null)).toBe("Not available");
  });
});

describe("pluralize and planLabel", () => {
  it("pluralizes by count", () => {
    expect(pluralize(1, "device")).toBe("1 device");
    expect(pluralize(3, "device")).toBe("3 devices");
  });

  it("labels plans in sentence case", () => {
    expect(planLabel("FREE")).toBe("Free");
    expect(planLabel("PRO")).toBe("Pro");
  });
});
