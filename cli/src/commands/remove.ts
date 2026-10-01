import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { removeAgentFile } from "../file-writer.js";
import { loadManifest, saveManifest } from "../manifest.js";

interface RemoveOptions {
  global?: boolean;
}

export async function removeCommand(slug: string, options: RemoveOptions) {
  const isTTY = isInteractive();
  const isGlobal = !!options.global;
  const rootDir = isGlobal ? (process.env.HOME || "/") : process.cwd();

  const manifest = loadManifest(isGlobal, rootDir);
  const agentIdx = manifest.agents.findIndex((a) => a.slug === slug);

  if (agentIdx === -1) {
    if (isTTY) {
      p.log.error(`Agent "${slug}" is not installed.`);
    } else {
      console.error(`Agent "${slug}" not installed.`);
    }
    process.exit(1);
  }

  const agent = manifest.agents[agentIdx]!;

  // Remove each file
  for (const file of agent.files) {
    try {
      removeAgentFile(file.path, slug, file.mode, rootDir);
      if (isTTY) {
        p.log.info(`Removed: ${pc.dim(file.path)}`);
      }
    } catch (err) {
      if (isTTY) p.log.warn(`Could not remove ${file.path}: ${(err as Error).message}`);
    }
  }

  // Remove from manifest
  manifest.agents.splice(agentIdx, 1);
  saveManifest(manifest, isGlobal, rootDir);

  if (isTTY) {
    p.log.success(`Agent "${pc.bold(slug)}" removed.`);
  } else {
    console.log(`Removed: ${slug}`);
  }
}
