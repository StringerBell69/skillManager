import type { AgentSource, RenderedFile, TargetTool } from "../schemas.js";

/**
 * Interface for a target tool adapter.
 * Each adapter knows how to render an AgentSource into a file
 * suitable for its target tool.
 */
export interface Adapter {
  name: TargetTool;
  render(agent: AgentSource): RenderedFile;
}
