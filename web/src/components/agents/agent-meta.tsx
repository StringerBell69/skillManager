import type { Plan } from "@skillmanager/shared/browser";
import { planLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { kindLabel } from "./kinds";

export function KindBadge({ kind }: { kind: string }) {
  return <Badge variant="neutral">{kindLabel(kind)}</Badge>;
}

/** Plan badge for agents that need a paid plan. Renders nothing for Free agents. */
export function PlanRequiredBadge({ plan }: { plan: Plan }) {
  if (plan === "FREE") return null;
  return <Badge variant="accent">{planLabel(plan)}</Badge>;
}

/**
 * The API reports "0.0.0" when an agent has no published version yet, so show
 * that as unreleased instead of a version number nobody shipped.
 */
export function AgentVersion({ version, className }: { version: string; className?: string }) {
  const value = version.trim();
  if (!value || value === "0.0.0") {
    return <span className={cn("text-xs text-faint-foreground", className)}>Not released</span>;
  }
  return (
    <span className={cn("font-mono text-xs text-muted-foreground tabular", className)}>
      v{value.replace(/^v/i, "")}
    </span>
  );
}
