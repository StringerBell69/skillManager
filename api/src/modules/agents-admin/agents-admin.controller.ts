import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AdminGuard } from "./admin.guard";
import { parseAgentSource } from "@skillmanager/shared";

class PublishAgentDto {
  slug!: string;
  version!: string;
  source!: string;
  changelog?: string;
}

@Controller("v1/admin/agents")
@UseGuards(AdminGuard)
export class AgentsAdminController {
  private readonly logger = new Logger(AgentsAdminController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Publish or update an agent from its .md source.
   * Upserts the Agent record and creates an AgentVersion.
   */
  @Post("publish")
  @HttpCode(200)
  async publishAgent(@Body() dto: PublishAgentDto) {
    // Parse the source to validate and extract frontmatter
    const parsed = parseAgentSource(dto.source);
    const { frontmatter } = parsed;

    // Upsert the agent
    const agent = await this.prisma.agent.upsert({
      where: { slug: dto.slug },
      create: {
        slug: dto.slug,
        name: frontmatter.name,
        description: frontmatter.description,
        kind: frontmatter.kind,
        planRequired: frontmatter.planRequired as any,
      },
      update: {
        name: frontmatter.name,
        description: frontmatter.description,
        kind: frontmatter.kind,
        planRequired: frontmatter.planRequired as any,
      },
    });

    // Create the version
    const version = await this.prisma.agentVersion.upsert({
      where: {
        agentId_version: {
          agentId: agent.id,
          version: dto.version,
        },
      },
      create: {
        agentId: agent.id,
        version: dto.version,
        body: parsed.body,
        frontmatter: frontmatter as any,
        changelog: dto.changelog,
        publishedAt: new Date(),
      },
      update: {
        body: parsed.body,
        frontmatter: frontmatter as any,
        changelog: dto.changelog,
        publishedAt: new Date(),
      },
    });

    this.logger.log(`Published agent: ${dto.slug}@${dto.version}`);

    return {
      slug: agent.slug,
      version: version.version,
      published: true,
    };
  }
}
