import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function networkError(): never {
  throw new TypeError("fetch failed");
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let apiGet: typeof import("@/lib/api-client").apiGet;
let apiPost: typeof import("@/lib/api-client").apiPost;
let apiDelete: typeof import("@/lib/api-client").apiDelete;
let ApiError: typeof import("@/lib/api-client").ApiError;

beforeEach(async () => {
  vi.useFakeTimers();
  process.env.NEXT_PUBLIC_API_URL = "http://test.api";
  globalThis.fetch = vi.fn();

  // Dynamic import so the module picks up the env var we just set.
  // resetModules ensures a fresh module graph each test.
  vi.resetModules();
  const mod = await import("@/lib/api-client");
  apiGet = mod.apiGet;
  apiPost = mod.apiPost;
  apiDelete = mod.apiDelete;
  ApiError = mod.ApiError;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_API_URL;
});

// ---------------------------------------------------------------------------
// apiGet — basic request shape
// ---------------------------------------------------------------------------

describe("apiGet", () => {
  it("sends GET with credentials: include and Content-Type JSON", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1 } }),
    );

    await apiGet("/users/1");

    expect(mock).toHaveBeenCalledOnce();
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe("http://test.api/users/1");
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("include");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("returns data on success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: { name: "Alice" } }),
    );

    const result = await apiGet("/me");
    expect(result).toEqual({ success: true, data: { name: "Alice" } });
  });
});

// ---------------------------------------------------------------------------
// apiPost — body serialization
// ---------------------------------------------------------------------------

describe("apiPost", () => {
  it("sends JSON-stringified body with POST method", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: null }),
    );

    await apiPost("/items", { title: "test" });

    const [, init] = mock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ title: "test" }));
  });

  it("sends undefined body when no payload given", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: null }),
    );

    await apiPost("/ping");

    const [, init] = mock.mock.calls[0];
    expect(init?.body).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// apiDelete
// ---------------------------------------------------------------------------

describe("apiDelete", () => {
  it("sends DELETE method", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: null }),
    );

    await apiDelete("/items/42");

    const [url, init] = mock.mock.calls[0];
    expect(url).toBe("http://test.api/items/42");
    expect(init?.method).toBe("DELETE");
  });
});

// ---------------------------------------------------------------------------
// 401 — session expired
// ---------------------------------------------------------------------------

describe("401 handling", () => {
  it("returns session expired error without retrying", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: "Unauthorized" }, 401),
    );

    const result = await apiGet("/secret");

    expect(result).toEqual({
      success: false,
      error: "Session expired — please sign in again",
    });
    // Should NOT retry on 401
    expect(mock).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// 5xx retries
// ---------------------------------------------------------------------------

describe("retry on 5xx", () => {
  it("retries up to 3 times then returns the last response error", async () => {
    const mock = vi.mocked(globalThis.fetch);

    // 4 calls total: initial + 3 retries
    for (let i = 0; i < 4; i++) {
      mock.mockResolvedValueOnce(
        jsonResponse({ success: false, error: "Internal Server Error" }, 500),
      );
    }

    const promise = apiGet("/unstable");

    // Advance through the 3 retry delays: 1000, 2000, 4000
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    const result = await promise;

    expect(mock).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      success: false,
      error: "Internal Server Error",
    });
  });

  it("succeeds on the second attempt after a 500", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: "oops" }, 500),
    );
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { ok: true } }),
    );

    const promise = apiGet("/flaky");
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(mock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true, data: { ok: true } });
  });
});

// ---------------------------------------------------------------------------
// Network error retries
// ---------------------------------------------------------------------------

describe("retry on network error", () => {
  it("retries network errors up to 3 times", async () => {
    const mock = vi.mocked(globalThis.fetch);

    for (let i = 0; i < 4; i++) {
      mock.mockRejectedValueOnce(new TypeError("fetch failed"));
    }

    const promise = apiGet("/down");

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    const result = await promise;

    expect(mock).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      success: false,
      error: "Network error — backend may be unavailable",
    });
  });

  it("succeeds after transient network failure", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockRejectedValueOnce(new TypeError("fetch failed"));
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: "ok" }),
    );

    const promise = apiGet("/recover");
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(mock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true, data: "ok" });
  });
});

// ---------------------------------------------------------------------------
// Invalid JSON
// ---------------------------------------------------------------------------

describe("invalid JSON response", () => {
  it("returns invalid JSON error for OK response with bad body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const result = await apiGet("/bad-json");

    expect(result).toEqual({ success: false, error: "Invalid JSON response" });
  });

  it("returns status error for non-OK response with bad body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response("not json", {
        status: 422,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const result = await apiGet("/bad-422");

    expect(result).toEqual({
      success: false,
      error: "Request failed with status 422",
    });
  });
});

// ---------------------------------------------------------------------------
// Non-OK with JSON body
// ---------------------------------------------------------------------------

describe("non-OK response with JSON body", () => {
  it("returns error from body envelope", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: false, error: "Not Found" }, 404),
    );

    const result = await apiGet("/missing");

    expect(result).toEqual({ success: false, error: "Not Found" });
  });

  it("falls back to status text when no error in envelope", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: false }, 403),
    );

    const result = await apiGet("/forbidden");

    expect(result).toEqual({
      success: false,
      error: "Request failed with status 403",
    });
  });
});

// ---------------------------------------------------------------------------
// Zod schema validation
// ---------------------------------------------------------------------------

describe("Zod schema validation", () => {
  const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
  });

  it("returns parsed data when schema matches", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1, name: "Alice" } }),
    );

    const result = await apiGet("/user", UserSchema);

    expect(result).toEqual({ success: true, data: { id: 1, name: "Alice" } });
  });

  it("returns validation error when data does not match schema", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { id: "not-a-number", name: 42 },
      }),
    );

    const result = await apiGet("/user", UserSchema);

    expect(result).toEqual({
      success: false,
      error: "Response validation failed",
    });
  });

  it("skips validation when no schema provided", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: { anything: true } }),
    );

    const result = await apiGet("/loose");

    expect(result).toEqual({ success: true, data: { anything: true } });
  });

  it("passes data through as-is when body.data is undefined and schema given", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ success: true }),
    );

    const result = await apiGet("/empty", UserSchema);

    // schema check is skipped when data is undefined
    expect(result).toEqual({ success: true, data: undefined });
  });
});

// ---------------------------------------------------------------------------
// AbortController timeout
// ---------------------------------------------------------------------------

describe("request timeout", () => {
  it("aborts request after 10 seconds", async () => {
    const mock = vi.mocked(globalThis.fetch);

    // Simulate a request that never resolves until aborted
    mock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          if (signal) {
            signal.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            });
          }
        }),
    );

    const promise = apiGet("/slow");

    // Advance past the 10s timeout
    await vi.advanceTimersByTimeAsync(10_000);

    // The first fetch aborts, which triggers a retry.
    // Advance through all retry delays too: 1000, 2000, 4000
    await vi.advanceTimersByTimeAsync(1_000);
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.advanceTimersByTimeAsync(2_000);
    await vi.advanceTimersByTimeAsync(10_000);
    await vi.advanceTimersByTimeAsync(4_000);
    await vi.advanceTimersByTimeAsync(10_000);

    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: "Network error — backend may be unavailable",
    });
  });
});

// ---------------------------------------------------------------------------
// API_BASE_URL from env
// ---------------------------------------------------------------------------

describe("API_BASE_URL", () => {
  it("prepends NEXT_PUBLIC_API_URL to path", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: null }),
    );

    await apiGet("/health");

    const [url] = mock.mock.calls[0];
    expect(url).toBe("http://test.api/health");
  });
});

// ---------------------------------------------------------------------------
// ApiError class
// ---------------------------------------------------------------------------

describe("ApiError", () => {
  it("has name, message, status, and optional requestId", () => {
    const err = new ApiError("Bad Request", 400, "req-123");

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Bad Request");
    expect(err.status).toBe(400);
    expect(err.requestId).toBe("req-123");
  });

  it("works without requestId", () => {
    const err = new ApiError("Not Found", 404);

    expect(err.requestId).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// X-Requested-With header
// ---------------------------------------------------------------------------

describe("headers", () => {
  it("includes X-Requested-With: XMLHttpRequest", async () => {
    const mock = vi.mocked(globalThis.fetch);
    mock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: null }),
    );

    await apiGet("/check");

    const [, init] = mock.mock.calls[0];
    expect(
      (init?.headers as Record<string, string>)["X-Requested-With"],
    ).toBe("XMLHttpRequest");
  });
});
