import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  Logger,
  Param,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CliTokenGuard } from "../cli-tokens/cli-token.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { render, applyWatermark } from "@skillmanager/shared";
import type {
  TargetTool,
  BundleResponse,
  BundleAgent,
  AgentSource,
} from "@skillmanager/shared";

// Plan hierarchy for filtering
const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
};

@Controller("v1")
export class BundleController {
  private readonly logger = new Logger(BundleController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the agent bundle for the authenticated CLI user.
   * Filters agents by plan, renders for requested targets,
   * and applies watermark.
   */
  @Get("bundle")
  @UseGuards(CliTokenGuard)
  async getBundle(
    @Query("targets") targetsParam: string,
    @Query("since") since: string | undefined,
    @CurrentUser() user: any,
  ): Promise<BundleResponse> {
    const subscription = user.subscription;

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new ForbiddenException({
        code: "LICENSE_EXPIRED",
        message: "Your subscription is not active. Renew at your dashboard.",
      });
    }

    const userPlan = subscription.plan as string;
    const userPlanLevel = PLAN_HIERARCHY[userPlan] ?? 0;

    // Parse targets
    const targets: TargetTool[] = targetsParam
      ? (targetsParam.split(",").filter(Boolean) as TargetTool[])
      : ["claude", "codex", "cursor", "gemini"];

    // Get all agents with their latest published version
    const agents = await this.prisma.agent.findMany({
      include: {
        versions: {
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
      },
    });

    const bundleAgents: BundleAgent[] = [];

    for (const agent of agents) {
      // Filter by plan
      const agentPlanLevel = PLAN_HIERARCHY[agent.planRequired] ?? 0;
      if (agentPlanLevel > userPlanLevel) continue;

      const latestVersion = agent.versions[0];
      if (!latestVersion) continue;

      // Check "since" for incremental updates
      if (since && latestVersion.version === since) continue;

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
        // Apply watermark using userId as seed
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
      plan: userPlan as any,
      agents: bundleAgents,
    };
  }

  /**
   * Get current user info.
   */
  @Get("me")
  @UseGuards(CliTokenGuard)
  async getMe(@CurrentUser() user: any) {
    const subscription = user.subscription;

    return {
      email: user.email,
      plan: subscription?.plan || "FREE",
      status: subscription?.status || "ACTIVE",
    };
  }

  /**
   * Fetch the raw mind of an agent by slug for MCP injection.
   */
  @Get("bundle/mind/:slug")
  @UseGuards(CliTokenGuard)
  async getAgentMind(@Param("slug") slug: string, @CurrentUser() user: any) {
    const subscription = user.subscription;

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new ForbiddenException({
        code: "LICENSE_EXPIRED",
        message: "Your subscription is not active. Renew at your dashboard.",
      });
    }

    const userPlan = subscription.plan as string;
    const userPlanLevel = PLAN_HIERARCHY[userPlan] ?? 0;

    const agent = await this.prisma.agent.findUnique({
      where: { slug },
      include: {
        versions: {
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!agent) {
      throw new ForbiddenException({
        code: "NOT_FOUND",
        message: `Agent ${slug} not found.`,
      });
    }

    const agentPlanLevel = PLAN_HIERARCHY[agent.planRequired] ?? 0;
    if (agentPlanLevel > userPlanLevel) {
      throw new ForbiddenException({
        code: "PLAN_INSUFFICIENT",
        message: `You need a higher plan to access ${slug}.`,
      });
    }

    const latestVersion = agent.versions[0];
    if (!latestVersion) {
      throw new ForbiddenException({
        code: "NOT_FOUND",
        message: `Agent ${slug} has no published versions.`,
      });
    }

    // Apply watermark for tracking leaks
    const watermarkedContent = applyWatermark(latestVersion.body, user.id);

    return {
      slug: agent.slug,
      version: latestVersion.version,
      content: watermarkedContent,
    };
  }
}
