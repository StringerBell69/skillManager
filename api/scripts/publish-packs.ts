/**
 * Publish packs from content/packs/packs.json to the API.
 * Usage: bun run scripts/publish-packs.ts
 *
 * Packs are Pro-only by product policy. Agents must already be published.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKS_FILE = path.resolve(__dirname, "../content/packs/packs.json");
const API_URL = process.env.SKILLMANAGER_API_URL || process.env.API_URL || "http://localhost:3001";
const ADMIN_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_KEY) {
  console.error("❌ ADMIN_API_KEY environment variable is required");
  process.exit(1);
}

interface PackDef {
  slug: string;
  name: string;
  description: string;
  planRequired: "FREE" | "PRO" | "TEAM";
  agentSlugs: string[];
}

async function main() {
  console.log(`📦 Publishing packs from ${PACKS_FILE}`);
  console.log(`🔗 API: ${API_URL}\n`);

  const packs = JSON.parse(fs.readFileSync(PACKS_FILE, "utf-8")) as PackDef[];

  for (const pack of packs) {
    if (pack.planRequired !== "PRO" && pack.planRequired !== "TEAM") {
      console.error(`  ❌ ${pack.slug}: packs must be PRO or TEAM (got ${pack.planRequired})`);
      continue;
    }
    if (pack.agentSlugs.length === 0) {
      console.error(`  ❌ ${pack.slug}: no agentSlugs`);
      continue;
    }

    console.log(`  Publishing ${pack.slug} (${pack.agentSlugs.length} agents)...`);

    try {
      const response = await fetch(`${API_URL}/v1/admin/packs/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": ADMIN_KEY as string,
        },
        body: JSON.stringify(pack),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error(`  ❌ ${pack.slug}: ${(body as { message?: string }).message || response.statusText}`);
      } else {
        const result = (await response.json()) as { agentsCount?: number };
        console.log(`  ✅ ${pack.slug} (${result.agentsCount ?? "?"} agents)`);
      }
    } catch (err) {
      console.error(`  ❌ ${pack.slug}: ${(err as Error).message}`);
    }
  }

  console.log("\n✅ Done!");
}

main();
