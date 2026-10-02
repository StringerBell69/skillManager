import { useId, useRef, useState, useTransition, type ReactNode } from "react";
import { Blocks, Search, SearchX } from "lucide-react";
import type { UnlockedAgent } from "@skillmanager/shared/browser";
import { useBilling, useCatalogAgents } from "@/hooks/useAccount";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/overview/query-error";
import { AgentVersion, KindBadge, PlanRequiredBadge } from "./agent-meta";
import { KNOWN_KINDS, isKnownKind, kindLabel, type KnownKind } from "./kinds";
import { PlanNotice } from "./plan-notice";

type KindFilter = "all" | KnownKind;

function matchesQuery(agent: UnlockedAgent, needle: string): boolean {
  if (!needle) return true;
  return [agent.name, agent.slug, agent.description].some((field) => field.toLowerCase().includes(needle));
}

function AgentRow({ agent }: { agent: UnlockedAgent }) {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{agent.name || agent.slug}</p>
        {/* The slug is what `sm remove` takes; only repeat it when it differs from the display name. */}
        {agent.name && agent.name !== agent.slug ? (
          <p className="mt-0.5 font-mono text-xs text-faint-foreground wrap-anywhere">{agent.slug}</p>
        ) : null}
        {agent.description ? (
          <p className="mt-1.5 line-clamp-2 text-13 text-muted-foreground">{agent.description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end sm:pt-px">
        <KindBadge kind={agent.kind} />
        <PlanRequiredBadge plan={agent.planRequired} />
        <AgentVersion version={agent.latestVersion} className="sm:inline-block sm:min-w-16 sm:text-right" />
      </div>
    </li>
  );
}

function CatalogSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading agents…</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-hidden>
        <Skeleton className="h-9 w-full sm:w-80" />
        <Skeleton className="h-9 w-72 max-w-full rounded-lg" />
      </div>
      <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface shadow-xs" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:gap-8 sm:px-5">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
              <Skeleton className="mt-3 h-3.5 w-full max-w-lg" />
              <Skeleton className="mt-1.5 h-3.5 w-2/3 max-w-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EMPTY_FRAME = "rounded-lg border border-border bg-surface shadow-xs";

export function AgentCatalog() {
  const agents = useCatalogAgents();
  const billing = useBilling();
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  // The input updates right away; filtering the list is a transition so typing never waits on it.
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [isFiltering, startTransition] = useTransition();

  const onSearch = (value: string) => {
    setInput(value);
    startTransition(() => setQuery(value));
  };

  const clearSearch = () => {
    onSearch("");
    searchRef.current?.focus();
  };

  const all = agents.data ?? [];
  const needle = query.trim().toLowerCase();
  const matching = all.filter((agent) => matchesQuery(agent, needle));
  const counts: Record<KindFilter, number> = { all: matching.length, agent: 0, skill: 0, rule: 0 };
  for (const agent of matching) {
    if (isKnownKind(agent.kind)) counts[agent.kind] += 1;
  }
  const visible = kind === "all" ? matching : matching.filter((agent) => agent.kind === kind);
  const filtered = needle !== "" || kind !== "all";

  let body: ReactNode;
  if (!agents.data) {
    body = agents.isError ? (
      <QueryError
        title="Could not load agents"
        error={agents.error}
        onRetry={() => void agents.refetch()}
        retrying={agents.isFetching}
      />
    ) : (
      <CatalogSkeleton />
    );
  } else if (all.length === 0) {
    const planLeavesOut = (billing.data?.usage.agentsTotal ?? 0) > 0;
    body = (
      <EmptyState
        icon={Blocks}
        className={EMPTY_FRAME}
        title={planLeavesOut ? "Your plan does not include any agents yet" : "No agents are published yet"}
        description={
          planLeavesOut
            ? "Upgrade from Billing to add the agents on paid plans."
            : "Agents show up here as soon as they are published."
        }
      />
    );
  } else {
    body = (
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full min-w-0 sm:max-w-80 sm:flex-1">
            <label htmlFor={searchId} className="sr-only">
              Search agents
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint-foreground"
              aria-hidden
            />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={input}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search by name or description…"
              autoComplete="off"
              spellCheck={false}
              className="h-9 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm text-foreground shadow-xs"
            />
          </div>
          <div className="-m-1 max-w-[calc(100%+0.5rem)] overflow-x-auto p-1 sm:shrink-0">
            <SegmentedControl<KindFilter>
              label="Filter by type"
              value={kind}
              onChange={setKind}
              options={(["all", ...KNOWN_KINDS] as const).map((value) => ({
                value,
                label: (
                  <>
                    {value === "all" ? "All" : kindLabel(value, true)}
                    <span className="text-faint-foreground tabular">{counts[value]}</span>
                  </>
                ),
              }))}
            />
          </div>
        </div>

        <p className="sr-only" role="status">
          {filtered ? pluralize(visible.length, "result") : ""}
        </p>

        {visible.length > 0 ? (
          <ul
            className={cn(
              "divide-y divide-border rounded-lg border border-border bg-surface shadow-xs transition-opacity duration-150",
              isFiltering && "opacity-70",
            )}
          >
            {visible.map((agent) => (
              <AgentRow key={agent.slug} agent={agent} />
            ))}
          </ul>
        ) : needle ? (
          <EmptyState
            icon={SearchX}
            className={EMPTY_FRAME}
            title={`No agents match “${query.trim()}”`}
            description={
              kind === "all"
                ? "Check the spelling, or search for part of a name."
                : `Only ${kindLabel(kind, true).toLowerCase()} are searched. Choose All to search everything.`
            }
            action={
              <Button variant="ghost" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Blocks}
            className={EMPTY_FRAME}
            title={`No ${kind === "all" ? "agents" : kindLabel(kind, true).toLowerCase()} on your plan`}
            action={
              <Button variant="ghost" onClick={() => setKind("all")}>
                Show all
              </Button>
            }
          />
        )}
      </>
    );
  }

  return (
    <section aria-labelledby={`${searchId}-heading`} className="flex flex-col gap-4">
      <h2 id={`${searchId}-heading`} className="sr-only">
        Agents on your plan
      </h2>
      <PlanNotice />
      {body}
    </section>
  );
}
