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
import { IsString, IsOptional, IsArray, IsEnum } from "class-validator";

class PublishAgentDto {
  @IsString()
  slug!: string;

  @IsString()
  version!: string;

  @IsString()
  source!: string;

  @IsString()
  @IsOptional()
  changelog?: string;
}

class PublishPackDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  planRequired!: string;

  @IsArray()
  @IsString({ each: true })
  agentSlugs!: string[];
}

@Controller("v1/admin")
@UseGuards(AdminGuard)
export class AgentsAdminController {
  private readonly logger = new Logger(AgentsAdminController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Publish or update an agent from its .md source.
   * Upserts the Agent record and creates an AgentVersion.
   */
  @Post("agents/publish")
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

  /**
   * Publish or update a pack.
   * Upserts the Pack and manages its agents.
   */
  @Post("packs/publish")
  @HttpCode(200)
  async publishPack(@Body() dto: PublishPackDto) {
    const pack = await this.prisma.pack.upsert({
      where: { slug: dto.slug },
      create: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        planRequired: dto.planRequired as any,
      },
      update: {
        name: dto.name,
        description: dto.description,
        planRequired: dto.planRequired as any,
      },
    });

    // We must clear old relations and set new ones to ensure correct ordering/agents
    await this.prisma.packAgent.deleteMany({
      where: { packId: pack.id },
    });

    let addedCount = 0;
    for (let i = 0; i < dto.agentSlugs.length; i++) {
      const agent = await this.prisma.agent.findUnique({
        where: { slug: dto.agentSlugs[i] },
      });
      if (!agent) {
        this.logger.warn(`Agent ${dto.agentSlugs[i]} not found while publishing pack ${dto.slug}`);
        continue;
      }
      await this.prisma.packAgent.create({
        data: {
          packId: pack.id,
          agentId: agent.id,
          position: i,
        },
      });
      addedCount++;
    }

    this.logger.log(`Published pack: ${dto.slug} (${addedCount} agents)`);

    return {
      slug: pack.slug,
      published: true,
      agentsCount: addedCount,
    };
  }
}

