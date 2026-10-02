import type { DeviceInfo } from "@skillmanager/shared/browser";
import { useDevices } from "@/hooks/useAccount";
import { formatDate, formatRelative } from "@/lib/format";
import { StatusDot } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Command } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "./query-error";
import { TextLink } from "./text-link";

const LIMIT = 3;

function lastActivity(device: DeviceInfo): number {
  const time = Date.parse(device.lastUsedAt ?? device.createdAt);
  return Number.isNaN(time) ? 0 : time;
}

function DeviceRow({ device }: { device: DeviceInfo }) {
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{device.name || "Unnamed device"}</p>
        <p className="text-13 text-muted-foreground">
          {device.lastUsedAt ? (
            <>
              Last used{" "}
              <time dateTime={device.lastUsedAt} title={formatDate(device.lastUsedAt)}>
                {formatRelative(device.lastUsedAt)}
              </time>
            </>
          ) : (
            <>
              Connected{" "}
              <time dateTime={device.createdAt} title={formatDate(device.createdAt)}>
                {formatRelative(device.createdAt)}
              </time>
              , not used yet
            </>
          )}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-13 text-muted-foreground">
        <StatusDot tone={device.isActive ? "success" : "neutral"} />
        {device.isActive ? "Active" : "Idle"}
      </span>
    </li>
  );
}

function RowsSkeleton() {
  return (
    <ul className="divide-y divide-border border-t border-border" aria-hidden>
      {Array.from({ length: LIMIT }, (_, index) => (
        <li key={index} className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex flex-col gap-1.5 py-0.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-4 w-14" />
        </li>
      ))}
    </ul>
  );
}

export function RecentDevicesCard() {
  const devices = useDevices();

  const recent = devices.data
    ? [...devices.data.devices].sort((a, b) => lastActivity(b) - lastActivity(a)).slice(0, LIMIT)
    : [];

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Recent devices</CardTitle>
        <TextLink to="/devices">View all</TextLink>
      </CardHeader>

      {devices.data ? (
        recent.length === 0 ? (
          <div className="border-t border-border px-5 py-5">
            <p className="text-13 text-muted-foreground">No devices yet. Sign in from a terminal to connect one.</p>
            <Command command="sm login" label="Copy sign-in command" className="mt-3" />
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {recent.map((device) => (
              <DeviceRow key={device.id} device={device} />
            ))}
          </ul>
        )
      ) : devices.isError ? (
        <div className="px-5 pb-5">
          <QueryError
            title="Could not load your devices"
            error={devices.error}
            onRetry={() => void devices.refetch()}
            retrying={devices.isFetching}
          />
        </div>
      ) : (
        <>
          <span className="sr-only" role="status">
            Loading devices…
          </span>
          <RowsSkeleton />
        </>
      )}
    </Card>
  );
}
