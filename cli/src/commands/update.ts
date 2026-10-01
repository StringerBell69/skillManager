import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { getBundle, ApiClientError } from "../api-client.js";
import { writeAgentFile, validatePath } from "../file-writer.js";
import { loadManifest, saveManifest, contentHash } from "../manifest.js";
import type { BundleAgent } from "@skillmanager/shared";

interface UpdateOptions {
  global?: boolean;
  force?: boolean;
}

export async function updateCommand(options: UpdateOptions) {
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

  if (isTTY) {
    p.intro(pc.bgCyan(pc.black(" SkillManager Update ")));
  }

  // Load manifest to get installed targets
  const manifest = loadManifest(isGlobal, rootDir);

  if (manifest.agents.length === 0) {
    if (isTTY) {
      p.log.info("No agents installed. Run " + pc.cyan("sm install") + " first.");
    } else {
      console.log("No agents installed.");
    }
    return;
  }

  // Determine installed targets from file paths
  const targets = new Set<string>();
  for (const agent of manifest.agents) {
    for (const file of agent.files) {
      if (file.path.startsWith(".claude/")) targets.add("claude");
      else if (file.path === "AGENTS.md") targets.add("codex");
      else if (file.path.startsWith(".cursor/")) targets.add("cursor");
      else if (file.path === "GEMINI.md") targets.add("gemini");
    }
  }

  // Fetch latest bundle
  let bundle;
  try {
    bundle = await getBundle(token, Array.from(targets));
  } catch (err) {
    if (err instanceof ApiClientError) {
      if (isTTY) p.log.error(err.message);
      else console.error(err.message);
    } else {
      console.error("Error:", (err as Error).message);
    }
    process.exit(1);
  }

  let updatedCount = 0;
  let addedCount = 0;
  let unchangedCount = 0;

  for (const agent of bundle.agents) {
    const existingEntry = manifest.agents.find((a) => a.slug === agent.slug);

    if (existingEntry && existingEntry.version === agent.version) {
      unchangedCount++;
      continue;
    }

    for (const file of agent.files) {
      try {
        validatePath(file.path, rootDir);
      } catch {
        continue;
      }
      writeAgentFile(file, agent.slug, rootDir);
    }

    // Update manifest
    const entry = {
      slug: agent.slug,
      version: agent.version,
      files: agent.files.map((f) => ({
        path: f.path,
        contentHash: contentHash(f.content),
        mode: f.mode,
      })),
    };

    const idx = manifest.agents.findIndex((a) => a.slug === agent.slug);
    if (idx >= 0) {
      manifest.agents[idx] = entry;
      updatedCount++;
    } else {
      manifest.agents.push(entry);
      addedCount++;
    }
  }

  saveManifest(manifest, isGlobal, rootDir);

  if (isTTY) {
    p.log.success(
      `${pc.bold("Update complete:")}\n` +
        `  ${pc.green(`${addedCount} added`)}  ${pc.yellow(`${updatedCount} updated`)}  ${pc.dim(`${unchangedCount} unchanged`)}`,
    );
    p.outro(pc.green("✓ Agents up to date!"));
  } else {
    console.log(`Update: ${addedCount} added, ${updatedCount} updated, ${unchangedCount} unchanged`);
  }
}
