import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./api";

function mockFetch(response: Response | Error) {
  const fn = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("sends JSON bodies with a bearer token", async () => {
    const fetchMock = mockFetch(json(200, { approved: true }));
    const result = await apiFetch<{ approved: boolean }>("/v1/cli/auth/approve", {
      method: "POST",
      json: { userCode: "KPTW-4827" },
      getToken: async () => "tok_123",
    });

    expect(result).toEqual({ approved: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/v1\/cli\/auth\/approve$/);
    expect(init.body).toBe(JSON.stringify({ userCode: "KPTW-4827" }));
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer tok_123");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("omits the content type and token when there is no body or session", async () => {
    const fetchMock = mockFetch(json(200, []));
    await apiFetch("/v1/me/devices", { getToken: async () => null });
    const headers = new Headers((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].headers);
    expect(headers.has("Content-Type")).toBe(false);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("maps API errors to ApiError with the server code and message", async () => {
    mockFetch(
      json(403, {
        statusCode: 403,
        code: "DEVICE_LIMIT_REACHED",
        message: "Your FREE plan allows 1 connected device.",
        details: { limit: 1 },
      }),
    );
    const error = await apiFetch("/v1/cli/auth/approve").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, code: "DEVICE_LIMIT_REACHED", details: { limit: 1 } });
    expect((error as ApiError).message).toBe("Your FREE plan allows 1 connected device.");
  });

  it("joins validation messages that arrive as an array", async () => {
    mockFetch(json(400, { statusCode: 400, message: ["plan must be PRO", "interval must be month or year"] }));
    const error = (await apiFetch("/v1/me/billing/checkout").catch((e: unknown) => e)) as ApiError;
    expect(error.code).toBe("UNKNOWN_ERROR");
    expect(error.message).toBe("plan must be PRO. interval must be month or year");
  });

  it("reports network failures as NETWORK_ERROR", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    const error = (await apiFetch("/v1/me/billing").catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(0);
    expect(error.code).toBe("NETWORK_ERROR");
  });
});
