import type { ErrorCode } from "@skillmanager/shared/browser";

export type ClientErrorCode = ErrorCode | "NETWORK_ERROR" | "UNKNOWN_ERROR";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ClientErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ClientErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

export type TokenGetter = () => Promise<string | null>;

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  getToken?: TokenGetter;
  /** Serialized as JSON and sent with a JSON content type. */
  json?: unknown;
}

function readMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const message = (payload as { message?: unknown }).message;
  // class-validator failures arrive as an array of messages.
  if (Array.isArray(message)) return message.filter((m) => typeof m === "string").join(". ");
  return typeof message === "string" ? message : undefined;
}

export async function apiFetch<T>(path: string, options: ApiRequestInit = {}): Promise<T> {
  const { getToken, json, headers, ...init } = options;
  const reqHeaders = new Headers(headers);
  reqHeaders.set("Accept", "application/json");

  if (json !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
  }

  if (getToken) {
    const token = await getToken();
    if (token) reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: reqHeaders,
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "We could not reach the SkillManager API. Check your connection and try again.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (payload ?? {}) as { code?: ClientErrorCode; details?: unknown };
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      readMessage(payload) ?? "Something went wrong. Please try again.",
      body.details,
    );
  }

  return payload as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
