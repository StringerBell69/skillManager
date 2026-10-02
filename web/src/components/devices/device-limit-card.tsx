import { Link } from "react-router-dom";
import type { DevicesResponse } from "@skillmanager/shared/browser";
import { planLabel, pluralize } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { Skeleton } from "@/components/ui/skeleton";
import { isAtDeviceLimit } from "./format";

export function DeviceLimitCard({ data }: { data: DevicesResponse }) {
  const plan = planLabel(data.plan);
  const atLimit = isAtDeviceLimit(data);

  return (
    <Card aria-labelledby="device-limit-title">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="device-limit-title" className="text-xs font-medium text-muted-foreground">
              Device limit
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {data.deviceLimit === null ? (
                <>
                  <span className="text-2xl font-semibold tracking-tight tabular text-foreground">{data.deviceCount}</span>{" "}
                  {data.deviceCount === 1 ? "device" : "devices"}, no limit on {plan}
                </>
              ) : (
                <>
                  <span className="text-2xl font-semibold tracking-tight tabular text-foreground">{data.deviceCount}</span> of{" "}
                  <span className="tabular">{pluralize(data.deviceLimit, "device")}</span>
                </>
              )}
            </p>
          </div>
          <Badge variant={data.plan === "FREE" ? "neutral" : "accent"}>
            {plan}
            <span className="sr-only"> plan</span>
          </Badge>
        </div>

        <Meter value={data.deviceCount} max={data.deviceLimit} label="Connected devices" />

        {atLimit ? (
          <Alert
            tone="warning"
            title="Device limit reached"
            action={
              data.plan === "FREE" ? (
                <Link to="/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  Upgrade to Pro
                </Link>
              ) : null
            }
          >
            You have reached the device limit of the {plan} plan. Revoke a device or upgrade to connect another one.
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function DeviceLimitCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}
