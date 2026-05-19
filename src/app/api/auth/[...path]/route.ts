import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const ALLOWED_PATHS = new Set([
  "challenge",
  "verify",
  "me",
  "session",
  "logout",
]);

async function proxyRequest(
  request: NextRequest,
  method: string,
  params: { path: string[] },
): Promise<NextResponse> {
  const subPath = params.path.join("/");

  if (!ALLOWED_PATHS.has(subPath)) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  const targetUrl = `${API_URL}/auth/${subPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) init.body = body;
    } catch {
      // No body
    }
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, init);
  } catch {
    return NextResponse.json(
      { success: false, error: "Backend unavailable" },
      { status: 502 },
    );
  }

  let responseBody: string;
  try {
    responseBody = await response.text();
  } catch {
    responseBody = "";
  }

  const res = new NextResponse(responseBody, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  const setCookie = response.headers.getSetCookie();
  for (const c of setCookie) {
    res.headers.append("Set-Cookie", c);
  }

  return res;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return proxyRequest(request, "GET", await context.params);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return proxyRequest(request, "POST", await context.params);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return proxyRequest(request, "DELETE", await context.params);
}
