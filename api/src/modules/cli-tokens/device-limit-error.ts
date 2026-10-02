import { ForbiddenException } from "@nestjs/common";
import type { Plan } from "@skillmanager/shared";

export function deviceLimitError(
  plan: Plan,
  limit: number,
  count: number,
): ForbiddenException {
  return new ForbiddenException({
    code: "DEVICE_LIMIT_REACHED",
    message: `Your ${plan} plan allows ${limit} connected device${limit === 1 ? "" : "s"}. Revoke one from the Devices page before adding another.`,
    details: { plan, limit, count },
  });
}
