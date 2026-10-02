import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CliTokenGuard } from "../cli-tokens/cli-token.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { render, applyWatermark } from "@skillmanager/shared";
import type {
  TargetTool,
  PackListItem,
  PackBundleResponse,
  BundleAgent,
  AgentSource,
} from "@skillmanager/shared";

// Plan hierarchy for filtering
const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
};

@Controller("v1/packs")
export class PacksController {
  private readonly logger = new Logger(PacksController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all available packs.
   */
  @Get()
  @UseGuards(CliTokenGuard)
  async listPacks(@CurrentUser() user: any): Promise<PackListItem[]> {
    const subscription = user.subscription;
    const userPlan = subscription?.plan || "FREE";
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

    return packs
      .filter((pack) => {
        const packPlanLevel = PLAN_HIERARCHY[pack.planRequired] ?? 0;
        return packPlanLevel <= userPlanLevel;
      })
      .map((pack) => ({
        slug: pack.slug,
        name: pack.name,
        description: pack.description,
        planRequired: pack.planRequired as any,
        agentCount: pack.agents.length,
        agentSlugs: pack.agents.map((pa) => pa.agent.slug),
      }));
  }

  /**
   * Get a pack's bundle: returns all agents in the pack,
   * rendered for the requested targets.
   */
  @Get(":slug/bundle")
  @UseGuards(CliTokenGuard)
  async getPackBundle(
    @Param("slug") slug: string,
    @Query("targets") targetsParam: string,
    @CurrentUser() user: any,
  ): Promise<PackBundleResponse> {
    const subscription = user.subscription;

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new ForbiddenException({
        code: "LICENSE_EXPIRED",
        message: "Your subscription is not active. Renew at your dashboard.",
      });
    }

    const userPlan = subscription.plan as string;
    const userPlanLevel = PLAN_HIERARCHY[userPlan] ?? 0;

    // Fetch the pack with its agents
    const pack = await this.prisma.pack.findUnique({
      where: { slug },
      include: {
        agents: {
          include: {
            agent: {
              include: {
                versions: {
                  where: { publishedAt: { not: null } },
                  orderBy: { publishedAt: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: `Pack "${slug}" not found.`,
      });
    }

    // Check pack plan requirement
    const packPlanLevel = PLAN_HIERARCHY[pack.planRequired] ?? 0;
    if (packPlanLevel > userPlanLevel) {
      throw new ForbiddenException({
        code: "PLAN_INSUFFICIENT",
        message: `Pack "${pack.name}" requires the ${pack.planRequired} plan.`,
      });
    }

    // Parse targets
    const targets: TargetTool[] = targetsParam
      ? (targetsParam.split(",").filter(Boolean) as TargetTool[])
      : ["claude", "codex", "cursor", "gemini"];

    const bundleAgents: BundleAgent[] = [];

    for (const packAgent of pack.agents) {
      const agent = packAgent.agent;

      // Filter by agent plan
      const agentPlanLevel = PLAN_HIERARCHY[agent.planRequired] ?? 0;
      if (agentPlanLevel > userPlanLevel) continue;

      const latestVersion = agent.versions[0];
      if (!latestVersion) continue;

      // Build the AgentSource
      const frontmatter = latestVersion.frontmatter as Record<string, any>;
      const agentSource: AgentSource = {
        slug: agent.slug,
        frontmatter: {
          name: agent.name,
          description: agent.description,
          kind: frontmatter.kind || agent.kind,
          tools: frontmatter.tools,
          model: frontmatter.model,
          tags: frontmatter.tags,
          planRequired: agent.planRequired,
        } as any,
        body: latestVersion.body,
      };

      // Render for each target
      const files = targets.map((target) => {
        const rendered = render(agentSource, target);
        const watermarkedContent = applyWatermark(rendered.content, user.id);
        return {
          path: rendered.path,
          content: watermarkedContent,
          mode: rendered.mode,
        };
      });

      bundleAgents.push({
        slug: agent.slug,
        version: latestVersion.version,
        files,
      });
    }

    return {
      pack: {
        slug: pack.slug,
        name: pack.name,
        description: pack.description,
      },
      plan: userPlan as any,
      agents: bundleAgents,
    };
  }
}
