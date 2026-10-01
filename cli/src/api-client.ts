import type {
  ApiError,
  DeviceFlowStartResponse,
  DeviceFlowPollResponse,
  MeResponse,
  BundleResponse,
} from "@skillmanager/shared";
import { API_URL, loadToken } from "./config.js";

class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let error: ApiError;
    try {
      error = (await response.json()) as ApiError;
    } catch {
      throw new ApiClientError(
        response.status,
        "INTERNAL_ERROR",
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }
    throw new ApiClientError(error.statusCode, error.code, error.message);
  }

  return response.json() as Promise<T>;
}

// ── Device Flow ──────────────────────────────────────────────

export async function startDeviceFlow(hostname?: string) {
  return request<DeviceFlowStartResponse>("POST", "/v1/cli/auth/start", {
    body: { hostname },
  });
}

export async function pollDeviceFlow(deviceCode: string) {
  return request<DeviceFlowPollResponse>("POST", "/v1/cli/auth/poll", {
    body: { deviceCode },
  });
}

// ── Authenticated Endpoints ─────────────────────────────────

export async function getMe(token: string) {
  return request<MeResponse>("GET", "/v1/me", { token });
}

export async function getBundle(token: string, targets: string[], since?: string) {
  const params = new URLSearchParams();
  if (targets.length) params.set("targets", targets.join(","));
  if (since) params.set("since", since);

  const query = params.toString();
  return request<BundleResponse>("GET", `/v1/bundle${query ? `?${query}` : ""}`, {
    token,
  });
}

export { ApiClientError };
