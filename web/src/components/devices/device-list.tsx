import { Laptop } from "lucide-react";
import type { DeviceInfo } from "@skillmanager/shared/browser";
import { formatDate, formatRelative } from "@/lib/format";
import { StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { deviceName, formatDateTime } from "./format";

interface DeviceListProps {
  devices: DeviceInfo[];
  onRevoke: (device: DeviceInfo) => void;
}

function DeviceStatus({ active }: { active: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", active ? "text-foreground" : "text-muted-foreground")}>
      <StatusDot tone={active ? "success" : "neutral"} />
      {active ? "Active" : "Idle"}
    </span>
  );
}

function LastUsed({ value }: { value: string | null }) {
  if (!value) return <span className="text-faint-foreground">Never</span>;
  return (
    <time dateTime={value} title={formatDateTime(value)}>
      {formatRelative(value)}
    </time>
  );
}

function Connected({ value }: { value: string }) {
  return (
    <time dateTime={value} title={formatDateTime(value)}>
      {formatDate(value)}
    </time>
  );
}

function RevokeButton({ device, onRevoke }: { device: DeviceInfo; onRevoke: (device: DeviceInfo) => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => onRevoke(device)} aria-label={`Revoke ${deviceName(device)}`}>
      Revoke
    </Button>
  );
}

const HEAD_CELL = "h-9 px-4 font-medium";

/** Table layout for md and up. */
export function DeviceTable({ devices, onRevoke }: DeviceListProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface shadow-xs md:block">
      <table className="w-full min-w-[640px] border-collapse text-left text-13">
        <caption className="sr-only">Connected devices</caption>
        <thead>
          <tr className="border-b border-border bg-subtle text-xs text-muted-foreground">
            <th scope="col" className={HEAD_CELL}>
              Device
            </th>
            <th scope="col" className={HEAD_CELL}>
              Status
            </th>
            <th scope="col" className={HEAD_CELL}>
              Last used
            </th>
            <th scope="col" className={HEAD_CELL}>
              Connected
            </th>
            <th scope="col" className="h-9 w-px px-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {devices.map((device) => (
            <tr key={device.id} className="h-12">
              <th scope="row" className="px-4 text-left font-medium text-foreground">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Laptop className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="max-w-[18rem] truncate">{deviceName(device)}</span>
                </span>
              </th>
              <td className="whitespace-nowrap px-4">
                <DeviceStatus active={device.isActive} />
              </td>
              <td className="whitespace-nowrap px-4 text-muted-foreground">
                <LastUsed value={device.lastUsedAt} />
              </td>
              <td className="whitespace-nowrap px-4 tabular text-muted-foreground">
                <Connected value={device.createdAt} />
              </td>
              <td className="px-2 text-right">
                <RevokeButton device={device} onRevoke={onRevoke} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Stacked rows below md, where four columns do not fit. */
export function DeviceStackedList({ devices, onRevoke }: DeviceListProps) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface shadow-xs md:hidden">
      {devices.map((device) => (
        <li key={device.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <Laptop className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="min-w-0 truncate text-sm font-medium text-foreground">{deviceName(device)}</p>
              <span className="shrink-0 text-13">
                <DeviceStatus active={device.isActive} />
              </span>
            </div>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 pl-6 text-13 text-muted-foreground">
              <span>
                {device.lastUsedAt ? (
                  <>
                    Last used <LastUsed value={device.lastUsedAt} />
                  </>
                ) : (
                  "Not used yet"
                )}
              </span>
              <span>
                Connected <Connected value={device.createdAt} />
              </span>
            </p>
          </div>
          <RevokeButton device={device} onRevoke={onRevoke} />
        </li>
      ))}
    </ul>
  );
}

/** Placeholder rows with the same height as real rows, for both layouts. */
export function DeviceListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs" aria-hidden>
      <div className="hidden h-9 items-center gap-4 border-b border-border bg-subtle px-4 md:flex">
        <Skeleton className="h-3 w-12" />
      </div>
      <ul className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="flex h-[68px] items-center gap-4 px-4 md:h-12">
            <Skeleton className="size-4 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:flex-row md:items-center md:gap-10">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-48 md:hidden" />
              <Skeleton className="hidden h-3.5 w-14 md:block" />
              <Skeleton className="hidden h-3.5 w-24 md:block" />
              <Skeleton className="hidden h-3.5 w-20 md:block" />
            </div>
            <Skeleton className="h-4 w-12" />
          </li>
        ))}
      </ul>
    </div>
  );
}
