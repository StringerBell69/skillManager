import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user
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

  // Create example agents
  const agents = [
    {
      slug: "code-reviewer",
      name: "code-reviewer",
      description: "Reviews code for quality, security, and best practices",
      kind: "agent",
      planRequired: "FREE" as const,
      version: "1.0.0",
      body: "You are a code review expert.\n\nAnalyze the provided code for:\n- Security vulnerabilities\n- Performance issues\n- Code style violations\n- Potential bugs\n\nProvide specific, actionable feedback with line numbers.",
      frontmatter: {
        name: "code-reviewer",
        description: "Reviews code for quality, security, and best practices",
        kind: "agent",
        tools: ["read_file", "grep", "list_dir"],
        tags: ["dev", "quality", "security"],
        planRequired: "FREE",
      },
    },
    {
      slug: "api-designer",
      name: "api-designer",
      description: "Helps design RESTful and GraphQL APIs following best practices",
      kind: "skill",
      planRequired: "PRO" as const,
      version: "1.0.0",
      body: "# API Design Skill\n\nGuide the user through designing APIs.\n\n## Steps\n1. Define resources and their relationships\n2. Design endpoint structure\n3. Define request/response schemas\n4. Plan authentication and authorization\n5. Document error handling patterns",
      frontmatter: {
        name: "api-designer",
        description: "Helps design RESTful and GraphQL APIs following best practices",
        kind: "skill",
        model: "claude-sonnet-4",
        tags: ["api", "architecture"],
        planRequired: "PRO",
      },
    },
    {
      slug: "typescript-standards",
      name: "typescript-standards",
      description: "Enforces TypeScript coding standards and best practices",
      kind: "rule",
      planRequired: "FREE" as const,
      version: "1.0.0",
      body: "## TypeScript Standards\n\n- Always use `interface` over `type` for object shapes\n- Use strict mode (`\"strict\": true` in tsconfig)\n- Prefer `const` assertions for literal types\n- Use `unknown` instead of `any` wherever possible\n- Always provide explicit return types for public functions\n- Use template literal types for string patterns",
      frontmatter: {
        name: "typescript-standards",
        description: "Enforces TypeScript coding standards and best practices",
        kind: "rule",
        tags: ["typescript", "standards"],
        planRequired: "FREE",
      },
    },
  ];

  for (const agentData of agents) {
    const agent = await prisma.agent.upsert({
      where: { slug: agentData.slug },
      create: {
        slug: agentData.slug,
        name: agentData.name,
        description: agentData.description,
        kind: agentData.kind,
        planRequired: agentData.planRequired,
      },
      update: {
        name: agentData.name,
        description: agentData.description,
        kind: agentData.kind,
        planRequired: agentData.planRequired,
      },
    });

    await prisma.agentVersion.upsert({
      where: {
        agentId_version: {
          agentId: agent.id,
          version: agentData.version,
        },
      },
      create: {
        agentId: agent.id,
        version: agentData.version,
        body: agentData.body,
        frontmatter: agentData.frontmatter,
        publishedAt: new Date(),
      },
      update: {
        body: agentData.body,
        frontmatter: agentData.frontmatter,
        publishedAt: new Date(),
      },
    });

    console.log(`  ✓ Agent: ${agentData.slug}@${agentData.version}`);
  }

  // ── Seed packs ──────────────────────────────────────────────
  const packs = [
    {
      slug: "code-quality",
      name: "Code Quality",
      description: "Everything you need for clean, secure, well-typed code",
      planRequired: "FREE" as const,
      agentSlugs: ["code-reviewer", "typescript-standards", "api-designer"],
    },
  ];

  for (const packData of packs) {
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

    // Link agents to pack
    for (let i = 0; i < packData.agentSlugs.length; i++) {
      const agent = await prisma.agent.findUnique({
        where: { slug: packData.agentSlugs[i] },
      });
      if (!agent) continue;

      await prisma.packAgent.upsert({
        where: {
          packId_agentId: {
            packId: pack.id,
            agentId: agent.id,
          },
        },
        create: {
          packId: pack.id,
          agentId: agent.id,
          position: i,
        },
        update: {
          position: i,
        },
      });
    }

    console.log(`  ✓ Pack: ${packData.name} (${packData.agentSlugs.length} agents)`);
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
