import type { DeviceInfo, DevicesResponse } from "@skillmanager/shared/browser";
import { ACTIVE_DEVICE_WINDOW_MS } from "@skillmanager/shared/browser";

const dateTimeFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

/** Full date and time for tooltips, e.g. "Oct 2, 2026, 4:05 PM". */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
}

/** Device names come from the machine's hostname, which can be empty. */
export function deviceName(device: Pick<DeviceInfo, "name">): string {
  return device.name.trim() || "Unnamed device";
}

export const ACTIVE_WINDOW_MINUTES = Math.round(ACTIVE_DEVICE_WINDOW_MS / 60_000);

export function isAtDeviceLimit(data: Pick<DevicesResponse, "deviceCount" | "deviceLimit">): boolean {
  return data.deviceLimit !== null && data.deviceCount >= data.deviceLimit;
}
