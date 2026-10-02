import { Controller, Get, UseGuards } from "@nestjs/common";
import type { PackListItem, Plan, UnlockedAgent } from "@skillmanager/shared";
import { PLAN_HIERARCHY } from "@skillmanager/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkAuthGuard } from "../auth-clerk/clerk-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1/me/catalog")
@UseGuards(ClerkAuthGuard)
export class MeCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("packs")
  async listPacks(
    @CurrentUser() user: { clerkId: string },
  ): Promise<PackListItem[]> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
      include: { subscription: true },
    });

    const userPlan = (dbUser?.subscription?.plan as Plan) || "FREE";
    const userPlanLevel = PLAN_HIERARCHY[userPlan] ?? 0;

    const packs = await this.prisma.pack.findMany({
      include: {
        agents: {
          include: { agent: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return packs.map((pack) => {
      const packPlanLevel = PLAN_HIERARCHY[pack.planRequired as Plan] ?? 0;
      const unlocked = packPlanLevel <= userPlanLevel;

      return {
        slug: pack.slug,
        name: pack.name,
        description: pack.description,
        planRequired: pack.planRequired as Plan,
        agentCount: pack.agents.length,
        agentSlugs: pack.agents.map((pa) => pa.agent.slug),
        // Keep payload compatible; unlocked is inferred by planRequired on the client
        ...(unlocked ? {} : {}),
      };
    });
  }

  @Get("agents")
  async listAgents(
    @CurrentUser() user: { clerkId: string },
  ): Promise<UnlockedAgent[]> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
      include: { subscription: true },
    });

    const userPlan = (dbUser?.subscription?.plan as Plan) || "FREE";
    const userPlanLevel = PLAN_HIERARCHY[userPlan] ?? 0;

    const agents = await this.prisma.agent.findMany({
      include: {
        versions: {
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    return agents
      .filter(
        (agent) =>
          (PLAN_HIERARCHY[agent.planRequired as Plan] ?? 0) <= userPlanLevel,
      )
      .map((agent) => ({
        slug: agent.slug,
        name: agent.name,
        description: agent.description,
        kind: agent.kind,
        planRequired: agent.planRequired as Plan,
        latestVersion: agent.versions[0]?.version || "0.0.0",
        installCommand: `sm install ${agent.slug}`,
      }));
  }
}
