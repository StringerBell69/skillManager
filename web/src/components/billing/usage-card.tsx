import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { BillingUsage, Plan } from "@skillmanager/shared/browser";
import { planLabel } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UsageRowProps {
  label: string;
  value: ReactNode;
  meter?: ReactNode;
  note?: ReactNode;
}

function UsageRow({ label, value, meter, note }: UsageRowProps) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4 text-13">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular text-foreground">{value}</span>
      </div>
      {meter}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </li>
  );
}

/**
 * Catalog coverage. A full Meter turns amber (it reads as "limit reached"),
 * so the bar only appears while part of the catalog is outside the plan.
 */
function CatalogRow({ label, included, total, plan }: { label: string; included: number; total: number; plan: Plan }) {
  const missing = Math.max(total - included, 0);
  return (
    <UsageRow
      label={label}
      value={`${included} of ${total}`}
      meter={missing > 0 ? <Meter value={included} max={total} label={label} /> : null}
      note={missing > 0 ? `${missing} not included in ${planLabel(plan)}` : total > 0 ? "All included" : null}
    />
  );
}

export function UsageCard({ usage, plan }: { usage: BillingUsage; plan: Plan }) {
  const { deviceCount, deviceLimit } = usage;
  const atLimit = deviceLimit !== null && deviceCount >= deviceLimit;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Usage</CardTitle>
          <CardDescription>What your {planLabel(plan)} plan covers right now.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-5">
          <UsageRow
            label="Connected devices"
            value={deviceLimit === null ? deviceCount : `${deviceCount} of ${deviceLimit}`}
            meter={<Meter value={deviceCount} max={deviceLimit} label="Connected devices" />}
            note={deviceLimit === null ? "No limit" : atLimit ? "Limit reached" : null}
          />
          <CatalogRow label="Agents available" included={usage.agentsUnlocked} total={usage.agentsTotal} plan={plan} />
          <CatalogRow label="Packs available" included={usage.packsUnlocked} total={usage.packsTotal} plan={plan} />
        </ul>
      </CardContent>
      <CardFooter className="gap-5">
        <Link to="/devices" className={cn(buttonVariants({ variant: "link" }), "min-h-6 text-13")}>
          Manage devices
        </Link>
        <Link to="/agents" className={cn(buttonVariants({ variant: "link" }), "min-h-6 text-13")}>
          Browse agents
        </Link>
      </CardFooter>
    </Card>
  );
}

export function UsageCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-3.5 w-48" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
