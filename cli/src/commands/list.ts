import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { getBundle, listPacks } from "../api-client.js";
import { loadManifest } from "../manifest.js";
import type { PackListItem } from "@skillmanager/shared";

interface ListOptions {
  global?: boolean;
}

export async function listCommand(options: ListOptions) {
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

  const manifest = loadManifest(isGlobal, rootDir);

  let bundle;
  let packs: PackListItem[] = [];
  try {
    [bundle, packs] = await Promise.all([
      getBundle(token, []),
      listPacks(token).catch(() => [] as PackListItem[]),
    ]);
  } catch {
    // Continue with local data only
  }

  if (isTTY) {
    p.intro(pc.bgCyan(pc.black(" SkillManager Agents ")));

    if (manifest.agents.length > 0) {
      p.log.info(pc.bold("Installed:"));
      for (const agent of manifest.agents) {
        console.log(`  ${pc.green("●")} ${pc.bold(agent.slug)} ${pc.dim(`v${agent.version}`)}`);
      }
    } else {
      p.log.info(pc.dim("No agents installed locally."));
    }

    if (bundle) {
      const installed = new Set(manifest.agents.map((a) => a.slug));
      const available = bundle.agents.filter((a) => !installed.has(a.slug));

      if (available.length > 0) {
        console.log("");
        p.log.info(pc.bold("Available agents:"));
        for (const agent of available) {
          console.log(`  ${pc.dim("○")} ${agent.slug} ${pc.dim(`v${agent.version}`)}`);
        }
      }
    }

    if (packs.length > 0) {
      console.log("");
      p.log.info(pc.bold("Packs on your plan:"));
      for (const pack of packs) {
        const count = `${pack.agentCount} agent${pack.agentCount === 1 ? "" : "s"}`;
        console.log(
          `  ${pc.cyan("◆")} ${pc.bold(pack.name || pack.slug)} ${pc.dim(`(${count})`)}`,
        );
        console.log(`      ${pc.dim(`sm install --pack ${pack.slug}`)}`);
      }
    }
  } else {
    console.log("Installed:");
    for (const agent of manifest.agents) {
      console.log(`  ${agent.slug} v${agent.version}`);
    }
    if (packs.length > 0) {
      console.log("Packs:");
      for (const pack of packs) {
        console.log(`  ${pack.slug} (${pack.agentCount})`);
      }
    }
  }
}
