export const KNOWN_KINDS = ["agent", "skill", "rule"] as const;
export type KnownKind = (typeof KNOWN_KINDS)[number];

const KIND_LABELS: Record<KnownKind, { one: string; many: string }> = {
  agent: { one: "Agent", many: "Agents" },
  skill: { one: "Skill", many: "Skills" },
  rule: { one: "Rule", many: "Rules" },
};

/** The API types `kind` as a plain string, so narrow it before using it as a filter. */
export function isKnownKind(kind: string): kind is KnownKind {
  return (KNOWN_KINDS as readonly string[]).includes(kind);
}

/** "agent" becomes "Agent". Unknown kinds from the API are shown as sent, capitalized. */
export function kindLabel(kind: string, plural = false): string {
  if (isKnownKind(kind)) return plural ? KIND_LABELS[kind].many : KIND_LABELS[kind].one;
  const trimmed = kind.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "Other";
}
