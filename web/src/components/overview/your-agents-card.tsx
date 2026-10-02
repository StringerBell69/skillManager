import { useBilling } from "@/hooks/useAccount";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentVersion, KindBadge } from "@/components/agents/agent-meta";
import { TextLink } from "./text-link";

const LIMIT = 5;

function RowsSkeleton() {
  return (
    <ul className="list-inset border-t border-border [--list-inset:1.25rem]" aria-hidden>
      {Array.from({ length: LIMIT }, (_, index) => (
        <li key={index} className="flex h-12 items-center justify-between gap-4 px-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </li>
      ))}
    </ul>
  );
}

export function YourAgentsCard() {
  const billing = useBilling();
  const agents = billing.data?.unlockedAgents ?? [];

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Your agents</CardTitle>
        <TextLink to="/agents">Browse all</TextLink>
      </CardHeader>

      {billing.data ? (
        agents.length === 0 ? (
          <p className="border-t border-border px-5 py-5 text-13 text-muted-foreground">
            {billing.data.usage.agentsTotal > 0
              ? "Your plan does not include any agents yet. See Billing to compare plans."
              : "No agents are published yet."}
          </p>
        ) : (
          <ul className="list-inset border-t border-border [--list-inset:1.25rem]">
            {agents.slice(0, LIMIT).map((agent) => (
              <li key={agent.slug} className="flex min-h-12 items-center justify-between gap-4 px-5 py-2.5">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">{agent.name || agent.slug}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <KindBadge kind={agent.kind} />
                  <AgentVersion version={agent.latestVersion} className="inline-block w-20 text-right" />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : billing.isError ? (
        // The page shows the retry alert for this query once, above the summary.
        <p className="border-t border-border px-5 py-5 text-13 text-muted-foreground">
          Your agents could not be loaded. Use Try again at the top of the page.
        </p>
      ) : (
        <>
          <span className="sr-only" role="status">
            Loading agents…
          </span>
          <RowsSkeleton />
        </>
      )}
    </Card>
  );
}
