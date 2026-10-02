import type { Plan } from "./schemas.js";

/** Max connected CLI devices per plan. `null` = unlimited. */
export const DEVICE_LIMITS: Record<Plan, number | null> = {
  FREE: 1,
  PRO: null,
  TEAM: null,
};

/** A device is "active" if it called the API within this window. */
export const ACTIVE_DEVICE_WINDOW_MS = 15 * 60 * 1000;

export const PLAN_HIERARCHY: Record<Plan, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
};

export function getDeviceLimit(plan: Plan): number | null {
  return DEVICE_LIMITS[plan] ?? 1;
}

export function isDeviceActive(
  lastUsedAt: Date | string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!lastUsedAt) return false;
  const ts = typeof lastUsedAt === "string" ? Date.parse(lastUsedAt) : lastUsedAt.getTime();
  if (Number.isNaN(ts)) return false;
  return now - ts <= ACTIVE_DEVICE_WINDOW_MS;
}

export function planAtLeast(userPlan: Plan, required: Plan): boolean {
  return (PLAN_HIERARCHY[userPlan] ?? 0) >= (PLAN_HIERARCHY[required] ?? 0);
}
