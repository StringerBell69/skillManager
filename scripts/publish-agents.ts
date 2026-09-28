/**
 * Script to publish agents from content/agents/ to the API.
 * Usage: bun run scripts/publish-agents.ts
 *
 * Reads all .md files in content/agents/, extracts frontmatter for the slug,
 * and calls POST /v1/admin/agents/publish for each.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = path.resolve(__dirname, "../content/agents");
const API_URL = process.env.SKILLMANAGER_API_URL || process.env.API_URL || "http://localhost:3001";
const ADMIN_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_KEY) {
  console.error("❌ ADMIN_API_KEY environment variable is required");
  process.exit(1);
}

async function main() {
  console.log(`📦 Publishing agents from ${AGENTS_DIR}`);
  console.log(`🔗 API: ${API_URL}\n`);

  const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.log("No .md files found.");
    return;
  }

  for (const file of files) {
    const filePath = path.join(AGENTS_DIR, file);
    const source = fs.readFileSync(filePath, "utf-8");
    const slug = path.basename(file, ".md");

    console.log(`  Publishing ${slug}...`);

    try {
      const response = await fetch(`${API_URL}/v1/admin/agents/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": ADMIN_KEY,
        },
        body: JSON.stringify({
          slug,
          version: "1.0.0",
          source,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        console.error(`  ❌ ${slug}: ${(body as any).message || response.statusText}`);
      } else {
        const result = await response.json();
        console.log(`  ✅ ${slug}@${(result as any).version}`);
      }
    } catch (err) {
      console.error(`  ❌ ${slug}: ${(err as Error).message}`);
    }
  }

  console.log("\n✅ Done!");
}

main();
