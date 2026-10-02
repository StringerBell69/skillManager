const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

function toDate(value: string | Date): Date | null {
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "Not available";
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "Not available";
}

/** "3 minutes ago", "yesterday", "just now". */
export function formatRelative(value: string | Date | null | undefined, now: number = Date.now()): string {
  if (!value) return "Never";
  const date = toDate(value);
  if (!date) return "Never";

  const diff = date.getTime() - now;
  if (Math.abs(diff) < 60 * 1000) return "just now";

  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) {
      return relativeFormatter.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const PLAN_LABELS = { FREE: "Free", PRO: "Pro", TEAM: "Team" } as const;

export function planLabel(plan: keyof typeof PLAN_LABELS): string {
  return PLAN_LABELS[plan] ?? plan;
}
