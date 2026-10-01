import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { getBundle } from "../api-client.js";
import { loadManifest } from "../manifest.js";

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

  // Load manifest for installed agents
  const manifest = loadManifest(isGlobal, rootDir);

  // Fetch available agents
  let bundle;
  try {
    bundle = await getBundle(token, []);
  } catch {
    // Continue with local data only
  }

  if (isTTY) {
    p.intro(pc.bgCyan(pc.black(" SkillManager Agents ")));

    // Installed agents
    if (manifest.agents.length > 0) {
      p.log.info(pc.bold("Installed:"));
      for (const agent of manifest.agents) {
        console.log(`  ${pc.green("●")} ${pc.bold(agent.slug)} ${pc.dim(`v${agent.version}`)}`);
      }
    } else {
      p.log.info(pc.dim("No agents installed locally."));
    }

    // Available agents (from bundle)
    if (bundle) {
      const installed = new Set(manifest.agents.map((a) => a.slug));
      const available = bundle.agents.filter((a) => !installed.has(a.slug));

      if (available.length > 0) {
        console.log("");
        p.log.info(pc.bold("Available:"));
        for (const agent of available) {
          console.log(`  ${pc.dim("○")} ${agent.slug} ${pc.dim(`v${agent.version}`)}`);
        }
      }
    }
  } else {
    console.log("Installed:");
    for (const agent of manifest.agents) {
      console.log(`  ${agent.slug} v${agent.version}`);
    }
  }
}
