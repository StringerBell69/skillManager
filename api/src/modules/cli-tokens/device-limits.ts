import {
  getDeviceLimit,
  isDeviceActive,
  planAtLeast,
  type Plan,
} from "@skillmanager/shared";
import { PrismaService } from "../../prisma/prisma.service";

export async function assertDeviceSlotAvailable(
  prisma: PrismaService,
  userId: string,
): Promise<{ plan: Plan; limit: number | null; count: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const plan = (user?.subscription?.plan as Plan) || "FREE";
  const limit = getDeviceLimit(plan);
  const count = await prisma.cliToken.count({
    where: { userId, revokedAt: null },
  });

  return { plan, limit, count };
}

export function mapDevices(
  tokens: Array<{
    id: string;
    name: string;
    lastUsedAt: Date | null;
    createdAt: Date;
  }>,
) {
  const now = Date.now();
  return tokens.map((token) => ({
    id: token.id,
    name: token.name,
    lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
    createdAt: token.createdAt.toISOString(),
    isActive: isDeviceActive(token.lastUsedAt, now),
  }));
}

export { planAtLeast, getDeviceLimit };
