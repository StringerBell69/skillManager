import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { getBundle, ApiClientError } from "../api-client.js";
import { writeAgentFile, validatePath } from "../file-writer.js";
import {
  loadManifest,
  saveManifest,
  contentHash,
  isFileModified,
} from "../manifest.js";
import type { BundleAgent } from "@skillmanager/shared";

interface InstallOptions {
  tools?: string;
  global?: boolean;
  project?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

const TOOL_DETECTORS: Record<string, string[]> = {
  claude: [".claude/", "~/.claude/"],
  codex: ["AGENTS.md"],
  cursor: [".cursor/"],
  gemini: ["GEMINI.md"],
};

export async function installCommand(options: InstallOptions) {
  const token = loadToken();
  if (!token) {
    if (isInteractive()) {
      p.log.warn("Not logged in. Run " + pc.cyan("sm login") + " first.");
    } else {
      console.error("Not logged in.");
    }
    process.exit(1);
  }

  const isTTY = isInteractive();
  const isGlobal = !!options.global;
  const rootDir = isGlobal ? (process.env.HOME || "/") : process.cwd();

  if (isTTY && !options.yes) {
    p.intro(pc.bgCyan(pc.black(" SkillManager Install ")));
  }

  // Determine targets
  let targets: string[];
  if (options.tools) {
    targets = options.tools.split(",").map((t) => t.trim());
  } else if (isTTY && !options.yes) {
    // Detect available tools and let user pick
    const detected = detectTools(rootDir);
    const allTools = ["claude", "codex", "cursor", "gemini"];

    const selected = await p.multiselect({
      message: "Which tools do you want to install agents for?",
      options: allTools.map((tool) => ({
        value: tool,
        label: tool.charAt(0).toUpperCase() + tool.slice(1),
        hint: detected.includes(tool) ? "detected" : undefined,
      })),
      initialValues: detected.length > 0 ? detected : allTools,
    });

    if (p.isCancel(selected)) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }

    targets = selected as string[];
  } else {
    targets = ["claude", "codex", "cursor", "gemini"];
  }

  // Fetch bundle
  let bundle;
  try {
    bundle = await getBundle(token, targets);
  } catch (err) {
    if (err instanceof ApiClientError) {
      if (err.code === "LICENSE_EXPIRED") {
        if (isTTY) {
          p.log.error(
            "Your subscription is not active. Renew at your dashboard.",
          );
        } else {
          console.error("Subscription not active.");
        }
      } else {
        if (isTTY) p.log.error(err.message);
        else console.error(err.message);
      }
    } else {
      console.error("Error:", (err as Error).message);
    }
    process.exit(1);
  }

  if (bundle.agents.length === 0) {
    if (isTTY) p.log.info("No agents available for your plan.");
    else console.log("No agents available.");
    return;
  }

  // Load existing manifest
  const manifest = loadManifest(isGlobal, rootDir);

  // Dry run mode
  if (options.dryRun) {
    if (isTTY) {
      p.log.info(pc.bold("Dry run — no files will be written:\n"));
    }
    for (const agent of bundle.agents) {
      for (const file of agent.files) {
        const fullPath = path.resolve(rootDir, file.path);
        const status = fs.existsSync(fullPath) ? pc.yellow("update") : pc.green("create");
        console.log(`  ${status} ${file.path}`);
      }
    }
    if (isTTY) {
      p.log.info(`\n${bundle.agents.length} agent(s) would be installed.`);
    }
    return;
  }

  // Write files
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const agent of bundle.agents) {
    const existingEntry = manifest.agents.find((a) => a.slug === agent.slug);

    for (const file of agent.files) {
      // Validate path for safety
      try {
        validatePath(file.path, rootDir);
      } catch (err) {
        if (isTTY) p.log.warn(`Skipping unsafe path: ${file.path}`);
        skipped++;
        continue;
      }

      const fullPath = path.resolve(rootDir, file.path);
      const existingFile = existingEntry?.files.find((f) => f.path === file.path);

      // Check for local modifications
      if (existingFile && !options.force) {
        if (isFileModified(fullPath, existingFile.contentHash)) {
          if (isTTY && !options.yes) {
            const confirm = await p.confirm({
              message: `${file.path} has been locally modified. Overwrite?`,
            });
            if (p.isCancel(confirm) || !confirm) {
              skipped++;
              continue;
            }
          } else if (!options.force) {
            skipped++;
            continue;
          }
        }
      }

      writeAgentFile(file, agent.slug, rootDir);

      if (fs.existsSync(fullPath)) {
        updated++;
      } else {
        created++;
      }
    }

    // Update manifest
    updateManifestEntry(manifest, agent);
  }

  saveManifest(manifest, isGlobal, rootDir);

  // Summary
  if (isTTY) {
    p.log.success(
      `${pc.bold("Install complete:")}\n` +
        `  ${pc.green(`${created} created`)}  ${pc.yellow(`${updated} updated`)}  ${pc.dim(`${skipped} skipped`)}`,
    );
    p.outro(pc.green("✓ Agents installed!"));
  } else {
    console.log(`Installed: ${created} created, ${updated} updated, ${skipped} skipped`);
  }
}

function detectTools(rootDir: string): string[] {
  const detected: string[] = [];

  for (const [tool, paths] of Object.entries(TOOL_DETECTORS)) {
    for (const p of paths) {
      const resolved = p.startsWith("~/")
        ? path.join(process.env.HOME || "/", p.slice(2))
        : path.resolve(rootDir, p);
      if (fs.existsSync(resolved)) {
        detected.push(tool);
        break;
      }
    }
  }

  return detected;
}

function updateManifestEntry(manifest: any, agent: BundleAgent) {
  const existing = manifest.agents.findIndex((a: any) => a.slug === agent.slug);
  const entry = {
    slug: agent.slug,
    version: agent.version,
    files: agent.files.map((f) => ({
      path: f.path,
      contentHash: contentHash(f.content),
      mode: f.mode,
    })),
  };

  if (existing >= 0) {
    manifest.agents[existing] = entry;
  } else {
    manifest.agents.push(entry);
  }
}
