import { z } from "zod";

// ── Agent kinds ──────────────────────────────────────────────
export const AgentKind = z.enum(["agent", "skill", "rule"]);
export type AgentKind = z.infer<typeof AgentKind>;

// ── Frontmatter schema ──────────────────────────────────────
export const AgentFrontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  kind: AgentKind,
  tools: z.array(z.string()).optional(),
  model: z.string().optional(),
  tags: z.array(z.string()).optional(),
  /** Minimum plan required to access this agent */
  planRequired: z.enum(["FREE", "PRO", "TEAM"]).optional().default("FREE"),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

export const AgentSourceSchema = z.object({
  slug: z.string().optional(),
  frontmatter: AgentFrontmatterSchema,
  body: z.string(),
});

export type AgentSource = z.infer<typeof AgentSourceSchema>;

// ── Supported targets ───────────────────────────────────────
export const TargetTool = z.enum(["claude", "codex", "cursor", "gemini"]);
export type TargetTool = z.infer<typeof TargetTool>;

// ── Rendered file output ────────────────────────────────────
export const FileWriteMode = z.enum(["write", "inject"]);
export type FileWriteMode = z.infer<typeof FileWriteMode>;

export interface RenderedFile {
  /** Relative path from project root (e.g. ".claude/agents/my-agent.md") */
  path: string;
  content: string;
  mode: FileWriteMode;
}

// ── Plan enum ───────────────────────────────────────────────
export const Plan = z.enum(["FREE", "PRO", "TEAM"]);
export type Plan = z.infer<typeof Plan>;

// ── Subscription status ─────────────────────────────────────
export const SubscriptionStatus = z.enum(["ACTIVE", "CANCELED", "PAST_DUE"]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
