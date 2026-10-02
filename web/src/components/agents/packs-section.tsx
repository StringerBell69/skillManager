import { useId } from "react";
import { planAtLeast, type PackListItem, type Plan } from "@skillmanager/shared/browser";
import { useBilling, useCatalogPacks } from "@/hooks/useAccount";
import { planLabel, pluralize } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/overview/query-error";
import { TextLink } from "@/components/overview/text-link";

const MAX_CHIPS = 6;
const GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

function PackCard({ pack, userPlan }: { pack: PackListItem; userPlan: Plan | null }) {
  const included = userPlan ? planAtLeast(userPlan, pack.planRequired) : null;
  const total = Math.max(pack.agentCount, pack.agentSlugs.length);
  const shown = pack.agentSlugs.slice(0, MAX_CHIPS);
  const hidden = total - shown.length;

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[15px] font-semibold tracking-tight text-foreground">{pack.name || pack.slug}</h3>
        {included === true ? <Badge variant="success">Included</Badge> : null}
        {included === false ? <Badge variant="accent">Requires {planLabel(pack.planRequired)}</Badge> : null}
      </div>
      {pack.description ? <p className="mt-1.5 line-clamp-3 text-13 text-muted-foreground">{pack.description}</p> : null}

      <div className="mt-auto pt-5">
        <div className="flex min-h-6 items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground tabular">{pluralize(total, "agent")}</p>
          {included === false ? <TextLink to="/billing">Upgrade</TextLink> : null}
        </div>
        {shown.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Agents in ${pack.name || pack.slug}`}>
            {shown.map((slug, index) => (
              <li
                key={`${index}:${slug}`}
                className="max-w-full truncate rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {slug}
              </li>
            ))}
            {hidden > 0 ? <li className="px-1 py-0.5 text-xs text-faint-foreground tabular">+{hidden} more</li> : null}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}

function PacksSkeleton() {
  return (
    <div className={GRID} role="status">
      <span className="sr-only">Loading packs…</span>
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="flex flex-col p-5" aria-hidden>
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2.5 h-3.5 w-full" />
          <Skeleton className="mt-1.5 h-3.5 w-3/4" />
          <Skeleton className="mt-6 h-4 w-16" />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PacksSection() {
  const packs = useCatalogPacks();
  const billing = useBilling();
  const headingId = useId();

  // Nothing to show: leave the section out entirely.
  if (packs.data && packs.data.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div>
        <h2 id={headingId} className="text-base font-semibold tracking-tight text-foreground">
          Packs
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated groups of agents. Packs marked Included are part of your plan.
        </p>
      </div>

      {packs.data ? (
        <ul className={GRID}>
          {packs.data.map((pack) => (
            <li key={pack.slug}>
              <PackCard pack={pack} userPlan={billing.data?.plan ?? null} />
            </li>
          ))}
        </ul>
      ) : packs.isError ? (
        <QueryError
          title="Could not load packs"
          error={packs.error}
          onRetry={() => void packs.refetch()}
          retrying={packs.isFetching}
        />
      ) : (
        <PacksSkeleton />
      )}
    </section>
  );
}
