// ── Schemas & Types ──────────────────────────────────────────
export {
  AgentKind,
  AgentFrontmatterSchema,
  AgentSourceSchema,
  TargetTool,
  FileWriteMode,
  Plan,
  SubscriptionStatus,
} from "./schemas.js";
export type {
  AgentFrontmatter,
  AgentSource,
  RenderedFile,
} from "./schemas.js";

// ── Parser ───────────────────────────────────────────────────
export {
  parseAgentSource,
  serializeAgentSource,
  extractFrontmatter,
} from "./parser.js";

// ── Adapters ─────────────────────────────────────────────────
export { render, renderAll } from "./adapters/index.js";
export type { Adapter } from "./adapters/types.js";
export { claudeAdapter } from "./adapters/claude.js";
export { codexAdapter } from "./adapters/codex.js";
export { cursorAdapter } from "./adapters/cursor.js";
export { geminiAdapter } from "./adapters/gemini.js";

// ── Markers ──────────────────────────────────────────────────
export {
  injectBlock,
  removeBlock,
  hasBlock,
  extractBlock,
} from "./markers.js";

// ── Watermark ────────────────────────────────────────────────
export {
  applyWatermark,
  hasWatermark,
  stripWatermarkComment,
} from "./watermark.js";

// ── API Types ────────────────────────────────────────────────
export type {
  DeviceFlowStartResponse,
  DeviceFlowPollStatus,
  DeviceFlowPollResponse,
  MeResponse,
  DeviceInfo,
  BundleAgentFile,
  BundleAgent,
  BundleResponse,
  ApiError,
  ErrorCode,
  PublishAgentRequest,
  PublishAgentResponse,
  AgentListItem,
} from "./api-types.js";
