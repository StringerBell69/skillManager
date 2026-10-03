import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAgentSource } from "@skillmanager/shared";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = path.resolve(__dirname, "../content/agents");
const PACKS_FILE = path.resolve(__dirname, "../content/packs/packs.json");

interface PackDef {
  slug: string;
  name: string;
  description: string;
  planRequired: "FREE" | "PRO" | "TEAM";
  agentSlugs: string[];
}

async function main() {
  console.log("🌱 Seeding database...");

  const user = await prisma.user.upsert({
    where: { clerkId: "user_test_123" },
    create: {
      clerkId: "user_test_123",
      email: "test@skillmanager.dev",
      subscription: {
        create: {
          plan: "PRO",
          status: "ACTIVE",
        },
      },
    },
    update: {},
  });

  console.log(`  ✓ User: ${user.email} (${user.id})`);

  const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md")).sort();
  for (const file of files) {
    const slug = path.basename(file, ".md");
    const source = fs.readFileSync(path.join(AGENTS_DIR, file), "utf-8");
    const { frontmatter, body } = parseAgentSource(source);
    const planRequired = (frontmatter.planRequired ?? "FREE") as "FREE" | "PRO" | "TEAM";
    const version = "1.0.0";

    const agent = await prisma.agent.upsert({
      where: { slug },
      create: {
        slug,
        name: frontmatter.name,
        description: frontmatter.description,
        kind: frontmatter.kind,
        planRequired,
      },
      update: {
        name: frontmatter.name,
        description: frontmatter.description,
        kind: frontmatter.kind,
        planRequired,
      },
    });

    await prisma.agentVersion.upsert({
      where: {
        agentId_version: {
          agentId: agent.id,
          version,
        },
      },
      create: {
        agentId: agent.id,
        version,
        body,
        frontmatter: frontmatter as object,
        publishedAt: new Date(),
      },
      update: {
        body,
        frontmatter: frontmatter as object,
        publishedAt: new Date(),
      },
    });

    console.log(`  ✓ Agent: ${slug}@${version} (${planRequired})`);
  }

  const packs = JSON.parse(fs.readFileSync(PACKS_FILE, "utf-8")) as PackDef[];

  // Retire the old Free demo pack if it still exists.
  await prisma.pack.deleteMany({ where: { slug: "code-quality" } });

  for (const packData of packs) {
    if (packData.planRequired !== "PRO" && packData.planRequired !== "TEAM") {
      throw new Error(`Pack ${packData.slug} must be PRO or TEAM`);
    }

    const pack = await prisma.pack.upsert({
      where: { slug: packData.slug },
      create: {
        slug: packData.slug,
        name: packData.name,
        description: packData.description,
        planRequired: packData.planRequired,
      },
      update: {
        name: packData.name,
        description: packData.description,
        planRequired: packData.planRequired,
      },
    });

    await prisma.packAgent.deleteMany({ where: { packId: pack.id } });

    for (let i = 0; i < packData.agentSlugs.length; i++) {
      const agent = await prisma.agent.findUnique({
        where: { slug: packData.agentSlugs[i] },
      });
      if (!agent) {
        console.warn(`  ⚠ Agent ${packData.agentSlugs[i]} missing for pack ${packData.slug}`);
        continue;
      }

      await prisma.packAgent.create({
        data: {
          packId: pack.id,
          agentId: agent.id,
          position: i,
        },
      });
    }

    console.log(`  ✓ Pack: ${packData.name} (${packData.agentSlugs.length} agents, ${packData.planRequired})`);
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
