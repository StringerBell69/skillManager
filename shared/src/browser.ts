/**
 * Browser-safe shared surface (no Node builtins).
 * Web clients should import from `@skillmanager/shared/browser`.
 */

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

export {
  DEVICE_LIMITS,
  ACTIVE_DEVICE_WINDOW_MS,
  PLAN_HIERARCHY,
  getDeviceLimit,
  isDeviceActive,
  planAtLeast,
} from "./plan-limits.js";

export type {
  DeviceFlowStartResponse,
  DeviceFlowPollStatus,
  DeviceFlowPollResponse,
  MeResponse,
  BillingInvoice,
  BillingUsage,
  UnlockedAgent,
  BillingSummaryResponse,
  DeviceInfo,
  DevicesResponse,
  BundleAgentFile,
  BundleAgent,
  BundleResponse,
  ApiError,
  ErrorCode,
  PublishAgentRequest,
  PublishAgentResponse,
  AgentListItem,
  PackListItem,
  PackBundleResponse,
} from "./api-types.js";
