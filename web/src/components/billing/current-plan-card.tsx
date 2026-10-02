import type { BillingSummaryResponse, SubscriptionStatus } from "@skillmanager/shared/browser";
import type { ApiError } from "@/lib/api";
import { formatDate, planLabel } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS: Record<SubscriptionStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  PAST_DUE: { label: "Payment overdue", variant: "warning" },
  CANCELED: { label: "Canceled", variant: "neutral" },
};

interface CurrentPlanCardProps {
  billing: BillingSummaryResponse;
  onManage: () => void;
  /** The portal request started from this card is in flight or redirecting. */
  managing: boolean;
  /** Another portal request is in flight, so this button waits. */
  disabled: boolean;
  portalError: ApiError | null;
}

function hasPassed(value: string): boolean {
  const time = Date.parse(value);
  return !Number.isNaN(time) && time < Date.now();
}

function DateLine({ prefix, value }: { prefix: string; value: string }) {
  return (
    <li>
      {prefix}{" "}
      <time dateTime={value} className="text-foreground">
        {formatDate(value)}
      </time>
    </li>
  );
}

export function CurrentPlanCard({ billing, onManage, managing, disabled, portalError }: CurrentPlanCardProps) {
  const paid = billing.plan !== "FREE";
  const status = STATUS[billing.status] ?? STATUS.ACTIVE;
  const periodEnd = billing.currentPeriodEnd;
  const periodEnded = periodEnd !== null && hasPassed(periodEnd);

  return (
    <Card aria-labelledby="current-plan-title">
      <CardContent>
        <h2 id="current-plan-title" className="text-xs font-medium text-muted-foreground">
          Current plan
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{planLabel(billing.plan)}</p>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <ul className="mt-3 flex flex-col gap-1 text-13 text-muted-foreground empty:hidden">
          {billing.status === "ACTIVE" && paid && periodEnd ? <DateLine prefix="Renews on" value={periodEnd} /> : null}
          {billing.status === "CANCELED" && periodEnd ? (
            <DateLine prefix={periodEnded ? "Ended on" : "Ends on"} value={periodEnd} />
          ) : null}
          {billing.memberSince ? <DateLine prefix="Member since" value={billing.memberSince} /> : null}
        </ul>

        {portalError ? (
          <Alert tone="danger" title="Could not open the billing portal" className="mt-4">
            {portalError.message || "Something went wrong on our side. Try again in a moment."}
          </Alert>
        ) : null}
      </CardContent>

      {paid ? (
        <CardFooter className="flex-col items-start sm:flex-row sm:items-center sm:gap-4">
          <Button variant="secondary" onClick={onManage} loading={managing} disabled={disabled}>
            Manage subscription
          </Button>
          <p className="text-13 text-muted-foreground">
            Change payment method, download receipts, or cancel in the Stripe billing portal.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export function CurrentPlanCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardContent>
        <Skeleton className="h-3 w-20" />
        <div className="mt-3 flex items-center gap-3">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-3.5 w-40" />
      </CardContent>
    </Card>
  );
}
