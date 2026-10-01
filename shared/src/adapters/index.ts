import type { AgentSource, RenderedFile, TargetTool } from "../schemas.js";
import type { Adapter } from "./types.js";
import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { cursorAdapter } from "./cursor.js";
import { geminiAdapter } from "./gemini.js";

export type { Adapter } from "./types.js";
export { claudeAdapter } from "./claude.js";
export { codexAdapter } from "./codex.js";
export { cursorAdapter } from "./cursor.js";
export { geminiAdapter } from "./gemini.js";

const adapters: Record<TargetTool, Adapter> = {
  claude: claudeAdapter,
  codex: codexAdapter,
  cursor: cursorAdapter,
  gemini: geminiAdapter,
};

/**
 * Render an agent for a specific target tool.
 */
export function render(agent: AgentSource, target: TargetTool): RenderedFile {
  const adapter = adapters[target];
  return adapter.render(agent);
}

/**
 * Render an agent for multiple target tools.
 */
export function renderAll(
  agent: AgentSource,
  targets: TargetTool[],
): RenderedFile[] {
  return targets.map((target) => render(agent, target));
}
