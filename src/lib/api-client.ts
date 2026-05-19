"use client";

import { z, type ZodType } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RETRY_DELAYS = [1000, 2000, 4000] as const;
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiSuccess<T> = { readonly success: true; readonly data: T };
type ApiFailure = { readonly success: false; readonly error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

interface BackendEnvelope<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly requestId?: string;
}

function isRetryable(status: number): boolean {
  return status >= 500 || status === 0;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
  schema?: ZodType<T>,
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers as Record<string, string>),
  };

  const init: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let lastError: string = "Unknown error";

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    let response: Response;
    try {
      response = await fetchWithTimeout(url, init);
    } catch {
      lastError = "Network error — backend may be unavailable";
      if (attempt < RETRY_DELAYS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        continue;
      }
      return { success: false, error: lastError };
    }

    if (response.status === 401) {
      return { success: false, error: "Session expired — please sign in again" };
    }

    if (isRetryable(response.status) && attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      continue;
    }

    let body: BackendEnvelope<T>;
    try {
      body = (await response.json()) as BackendEnvelope<T>;
    } catch {
      if (!response.ok) {
        return {
          success: false,
          error: `Request failed with status ${response.status}`,
        };
      }
      return { success: false, error: "Invalid JSON response" };
    }

    if (!response.ok) {
      return {
        success: false,
        error: body.error ?? `Request failed with status ${response.status}`,
      };
    }

    if (schema && body.data !== undefined) {
      const parsed = schema.safeParse(body.data);
      if (!parsed.success) {
        return { success: false, error: "Response validation failed" };
      }
      return { success: true, data: parsed.data };
    }

    return { success: true, data: body.data as T };
  }

  return { success: false, error: lastError };
}

export async function apiGet<T>(
  path: string,
  schema?: ZodType<T>,
): Promise<ApiResult<T>> {
  return fetchApi<T>(path, { method: "GET" }, schema);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  schema?: ZodType<T>,
): Promise<ApiResult<T>> {
  return fetchApi<T>(
    path,
    {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
    },
    schema,
  );
}

export async function apiDelete<T>(
  path: string,
  schema?: ZodType<T>,
): Promise<ApiResult<T>> {
  return fetchApi<T>(path, { method: "DELETE" }, schema);
}
