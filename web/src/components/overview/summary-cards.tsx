import type { ReactNode } from "react";
import type { BillingSummaryResponse } from "@skillmanager/shared/browser";
import { formatDate, pluralize, planLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { Skeleton } from "@/components/ui/skeleton";
import { TextLink } from "./text-link";

interface StatCardProps {
  label: string;
  value: ReactNode;
  context: ReactNode;
  /** Optional visual under the context line, e.g. a usage meter. */
  children?: ReactNode;
  link: { to: string; label: string };
}

function StatCard({ label, value, context, children, link }: StatCardProps) {
  return (
    <Card className="flex flex-col p-5">
      <h2 className="text-xs font-medium text-muted-foreground">{label}</h2>
      <div className="mt-2 flex min-h-8 flex-wrap items-center gap-x-2.5 gap-y-1">{value}</div>
      <p className="mt-1.5 text-13 text-muted-foreground">{context}</p>
      {children}
      <div className="mt-auto pt-4">
        <TextLink to={link.to}>{link.label}</TextLink>
      </div>
    </Card>
  );
}

/** Large number with a smaller muted qualifier: "3 of 5". */
function Count({ value, suffix }: { value: number; suffix: string }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className="text-2xl font-semibold tracking-tight text-foreground tabular">{value}</span>
      <span className="text-sm text-muted-foreground tabular">{suffix}</span>
    </p>
  );
}

const STATUS_BADGE = {
  ACTIVE: { label: "Active", variant: "accent" },
  PAST_DUE: { label: "Past due", variant: "warning" },
  CANCELED: { label: "Canceled", variant: "neutral" },
} as const;

function PlanCard({ billing }: { billing: BillingSummaryResponse }) {
  const paid = billing.plan !== "FREE";
  const badge = paid ? STATUS_BADGE[billing.status] : { label: "Active", variant: "neutral" as const };

  let context: string;
  if (paid && billing.status === "ACTIVE" && billing.currentPeriodEnd) {
    context = `Renews on ${formatDate(billing.currentPeriodEnd)}`;
  } else if (paid && billing.status === "CANCELED" && billing.currentPeriodEnd) {
    context = `Ends on ${formatDate(billing.currentPeriodEnd)}`;
  } else if (paid && billing.status === "PAST_DUE") {
    context = "Renewal payment failed";
  } else if (billing.memberSince) {
    context = `Member since ${formatDate(billing.memberSince)}`;
  } else {
    context = paid ? "No renewal date on file" : "No subscription";
  }

  return (
    <StatCard
      label="Plan"
      value={
        <>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{planLabel(billing.plan)}</p>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </>
      }
      context={context}
      link={paid ? { to: "/billing", label: "Manage billing" } : { to: "/billing", label: "Upgrade to Pro" }}
    />
  );
}

function DevicesCard({ billing }: { billing: BillingSummaryResponse }) {
  const { deviceCount, deviceLimit } = billing.usage;
  const plan = planLabel(billing.plan);

  let context: string;
  if (deviceLimit === null) {
    context = `No device limit on the ${plan} plan`;
  } else if (deviceCount >= deviceLimit) {
    context = `Limit reached on the ${plan} plan`;
  } else {
    context = `You can connect ${pluralize(deviceLimit - deviceCount, "more device")}`;
  }

  return (
    <StatCard
      label="Devices"
      value={
        deviceLimit === null ? (
          <Count value={deviceCount} suffix="connected" />
        ) : (
          <Count value={deviceCount} suffix={`of ${deviceLimit}`} />
        )
      }
      context={context}
      link={{ to: "/devices", label: "Manage devices" }}
    >
      <Meter value={deviceCount} max={deviceLimit} label="Connected devices" className="mt-3" />
    </StatCard>
  );
}

function AgentsCard({ billing }: { billing: BillingSummaryResponse }) {
  const { agentsUnlocked, agentsTotal } = billing.usage;

  let context: string;
  if (agentsTotal === 0) {
    context = "No agents are published yet";
  } else if (agentsUnlocked >= agentsTotal) {
    context = "Every agent is included in your plan";
  } else {
    context = `Available on the ${planLabel(billing.plan)} plan`;
  }

  return (
    <StatCard
      label="Agents"
      value={<Count value={agentsUnlocked} suffix={`of ${agentsTotal}`} />}
      context={context}
      link={{ to: "/agents", label: "Browse agents" }}
    />
  );
}

export function SummaryCards({ billing }: { billing: BillingSummaryResponse }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PlanCard billing={billing} />
      <DevicesCard billing={billing} />
      <AgentsCard billing={billing} />
    </div>
  );
}

function StatCardSkeleton({ meter = false }: { meter?: boolean }) {
  return (
    <Card className="flex flex-col p-5">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="mt-2 h-8 w-24" />
      <Skeleton className="mt-1.5 h-5 w-40" />
      {meter ? <Skeleton className="mt-3 h-1.5 w-full rounded-full" /> : null}
      <div className="mt-auto pt-4">
        <Skeleton className="h-6 w-28" />
      </div>
    </Card>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3" role="status">
      <span className="sr-only">Loading your plan and usage…</span>
      <StatCardSkeleton />
      <StatCardSkeleton meter />
      <StatCardSkeleton />
    </div>
  );
}
