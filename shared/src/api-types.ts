/**
 * Shared API response types used by both the API and CLI.
 */

import type { Plan, SubscriptionStatus, FileWriteMode } from "./schemas.js";

// ── Auth: Device Flow ────────────────────────────────────────

export interface DeviceFlowStartResponse {
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  interval: number;
  expiresIn: number;
}

export type DeviceFlowPollStatus = "pending" | "approved" | "denied" | "expired";

export interface DeviceFlowPollResponse {
  status: DeviceFlowPollStatus;
  /** Only present when status === "approved" */
  token?: string;
}

// ── Auth: Me ─────────────────────────────────────────────────

export interface MeResponse {
  email: string;
  plan: Plan;
  status: SubscriptionStatus;
}

// ── CLI Tokens / Devices ─────────────────────────────────────

export interface DeviceInfo {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

// ── Bundle ───────────────────────────────────────────────────

export interface BundleAgentFile {
  path: string;
  content: string;
  mode: FileWriteMode;
}

export interface BundleAgent {
  slug: string;
  version: string;
  files: BundleAgentFile[];
}

export interface BundleResponse {
  plan: Plan;
  agents: BundleAgent[];
  /** ETag for cache invalidation */
  etag?: string;
}

// ── Errors ───────────────────────────────────────────────────

export type ErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_REVOKED"
  | "TOKEN_INVALID"
  | "LICENSE_EXPIRED"
  | "SUBSCRIPTION_REQUIRED"
  | "PLAN_INSUFFICIENT"
  | "DEVICE_CODE_EXPIRED"
  | "DEVICE_CODE_INVALID"
  | "USER_CODE_INVALID"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "FORBIDDEN"
  | "WEBHOOK_SIGNATURE_INVALID";

export interface ApiError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  /** Additional details (validation errors, etc.) */
  details?: unknown;
}

// ── Admin ────────────────────────────────────────────────────

export interface PublishAgentRequest {
  slug: string;
  version: string;
  source: string; // Raw .md content (frontmatter + body)
  changelog?: string;
}

export interface PublishAgentResponse {
  slug: string;
  version: string;
  published: boolean;
}

// ── Agent listing ────────────────────────────────────────────

export interface AgentListItem {
  slug: string;
  name: string;
  description: string;
  kind: string;
  planRequired: Plan;
  latestVersion: string;
}
