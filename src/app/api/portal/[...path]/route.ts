import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function forward(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (
    !path.length ||
    !["admin", "demo"].includes(path[0]) ||
    path.some((segment) => !/^[a-zA-Z0-9_-]+$/.test(segment))
  ) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  const base =
    process.env.PORTAL_API_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? "http://127.0.0.1:18080/playngo-sandbox/portal"
      : "http://127.0.0.1:8094");
  const target = new URL(
    `${base.replace(/\/$/, "")}/${path.join("/")}${request.nextUrl.search}`,
  );
  const headers = new Headers({ Accept: "application/json" });
  for (const key of ["content-type", "origin", "user-agent"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  const cookies = request.cookies
    .getAll()
    .filter(({ name }) =>
      /^(?:__Host-aurevia_(?:admin|demo)|aurevia_(?:admin|demo)_test)$/.test(
        name,
      ),
    );
  if (cookies.length)
    headers.set(
      "cookie",
      cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
    );
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) {
        await reader.cancel();
        return Response.json({ error: "request_too_large" }, { status: 413 });
      }
      chunks.push(value);
    }
    body = Buffer.concat(chunks).toString("utf8");
  }
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(25000),
    });
    const output = new Headers({
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Cloudflare-CDN-Cache-Control": "no-store",
    });
    for (const key of [
      "content-type",
      "content-disposition",
      "retry-after",
      "x-request-id",
    ]) {
      const value = upstream.headers.get(key);
      if (value) output.set(key, value);
    }
    for (const value of upstream.headers.getSetCookie())
      output.append("set-cookie", value);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: output,
    });
  } catch {
    return Response.json(
      { error: "service_unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "Retry-After": "5" },
      },
    );
  }
}

export const GET = forward;
export const POST = forward;
