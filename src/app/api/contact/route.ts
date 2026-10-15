import { isLocale, localizedPath } from "@/lib/i18n";
import { NextResponse } from "next/server";
import { z } from "zod";

import { siteContent } from "@/content/site-content";
import { getClientIp } from "@/lib/client-ip";
import { CONTACT_MAX_LENGTH, isValidContact } from "@/lib/contact-validation";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
// Nginx always sets X-Real-IP, so a request without one means the proxy is
// misconfigured (or this is local development). Those requests share a bucket;
// the per-IP limit would let five posts lock every visitor out.
const UNVERIFIED_CLIENT_KEY = "unverified-client";
const UNVERIFIED_CLIENT_MAX_REQUESTS = 30;
const MAX_REQUEST_BYTES = 32 * 1024;
const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
const TURNSTILE_ACTION = "request_quote";

const quoteRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().max(CONTACT_MAX_LENGTH).refine(isValidContact),
  company: z.string().trim().max(140),
  targetMarket: z.string().trim().max(160),
  service: z
    .string()
    .trim()
    .max(120)
    .refine((value) =>
      siteContent.contactPage.form.projectTypes.includes(value),
    ),
  project: z.string().trim().max(120),
  budget: z.string().trim().max(120),
  timeline: z.string().trim().max(120),
  message: z.string().trim().min(20).max(3000),
  consent: z.literal("accepted"),
});

type QuoteRequest = z.infer<typeof quoteRequestSchema>;
type ContactStatus =
  | "success"
  | "invalid"
  | "verification"
  | "unavailable"
  | "error"
  | "rate-limited";

function getRateLimitRetryAfter(
  clientIp: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
): number | null {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(clientIp);

  if (!current) {
    if (rateLimitStore.size >= 5000) {
      const oldestKey = rateLimitStore.keys().next().value as string | undefined;
      if (oldestKey) {
        rateLimitStore.delete(oldestKey);
      }
    }

    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  current.count += 1;
  rateLimitStore.set(clientIp, current);

  return current.count > maxRequests
    ? Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    : null;
}

function checkRateLimit(request: Request): number | null {
  const clientIp = getClientIp(request.headers);

  if (clientIp) {
    return getRateLimitRetryAfter(clientIp);
  }

  const shared = rateLimitStore.get(UNVERIFIED_CLIENT_KEY);

  // Warn once per window rather than on every request.
  if (!shared || shared.resetAt <= Date.now()) {
    console.warn(
      "Contact request has no valid X-Real-IP; using the shared rate limit. Check the Nginx real-IP configuration.",
    );
  }

  return getRateLimitRetryAfter(
    UNVERIFIED_CLIENT_KEY,
    UNVERIFIED_CLIENT_MAX_REQUESTS,
  );
}

// Returns null once the body exceeds the limit. Content-Length alone cannot be
// trusted: chunked requests have none, and request.formData() would read them
// without bound.
async function readBodyWithLimit(
  request: Request,
  limit: number,
): Promise<Blob | null> {
  if (!request.body) {
    return new Blob();
  }

  const reader = request.body.getReader();
  const chunks: BlobPart[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }

  return new Blob(chunks);
}

function readField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function wantsJson(request: Request): boolean {
  return (
    request.headers.get("accept")?.includes("application/json") === true ||
    request.headers.get("x-requested-with") === "fetch"
  );
}

function contactResponse(
  request: Request,
  status: ContactStatus,
  httpStatus: number,
  headers: HeadersInit = {},
) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");

  if (wantsJson(request)) {
    return NextResponse.json(
      { ok: status === "success", status },
      { status: httpStatus, headers: responseHeaders },
    );
  }

  let locale = "en";
  try {
    const referrer = new URL(request.headers.get("referer") ?? "");
    const segment = referrer.pathname.split("/")[1];
    if (referrer.origin === new URL(request.url).origin && isLocale(segment)) locale = segment;
  } catch { /* Missing or invalid referrer uses English. */ }
  const url = new URL(localizedPath("/contact", isLocale(locale) ? locale : "en"), request.url);
  url.searchParams.set("status", status);
  url.hash = "quote-form";
  const response = NextResponse.redirect(url, 303);

  for (const [key, value] of responseHeaders) {
    response.headers.set(key, value);
  }

  return response;
}

function allowedRequestOrigins(): Set<string> {
  const canonicalUrl = new URL(siteContent.brand.url);
  const origins = new Set([canonicalUrl.origin]);

  if (!canonicalUrl.hostname.startsWith("www.")) {
    const wwwUrl = new URL(canonicalUrl);
    wwwUrl.hostname = `www.${canonicalUrl.hostname}`;
    origins.add(wwwUrl.origin);
  }

  return origins;
}

// Cuts at a code point boundary so an emoji is never split into a lone
// surrogate, which Telegram rejects. Staying within the UTF-16 length also
// keeps the text within the limit however Telegram counts characters.
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  let truncated = "";
  for (const character of text) {
    if (truncated.length + character.length > maxLength) break;
    truncated += character;
  }
  return truncated;
}

function formatMessage(payload: QuoteRequest): string {
  const text = [
    "New Aurevia Gaming project request",
    "",
    `Name: ${payload.name}`,
    `Email or Telegram: ${payload.contact}`,
    `Company: ${payload.company || "Not provided"}`,
    `Target market: ${payload.targetMarket || "Not provided"}`,
    `Service: ${payload.service}`,
    `Project: ${payload.project || "Not provided"}`,
    `Budget: ${payload.budget || "Not provided"}`,
    `Timeline: ${payload.timeline || "Not provided"}`,
    "",
    "Brief:",
    payload.message,
  ].join("\n");

  return truncateText(text, TELEGRAM_MAX_MESSAGE_LENGTH);
}

async function deliverToTelegram(payload: QuoteRequest): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(payload),
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Telegram delivery returned HTTP", response.status);
  }

  return response.ok;
}

async function deliverToWebhook(payload: QuoteRequest): Promise<boolean> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  let parsedWebhookUrl: URL;

  try {
    parsedWebhookUrl = new URL(webhookUrl);
  } catch {
    console.error("CONTACT_WEBHOOK_URL is not a valid URL");
    return false;
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsedWebhookUrl.protocol !== "https:"
  ) {
    console.error("CONTACT_WEBHOOK_URL must use HTTPS in production");
    return false;
  }

  const bearerToken = process.env.CONTACT_WEBHOOK_BEARER_TOKEN;
  const response = await fetch(parsedWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify({
      source: siteContent.brand.url,
      submittedAt: new Date().toISOString(),
      ...payload,
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });

  return response.ok;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : error;
}

// Telegram is tried first; the webhook is the fallback whether Telegram
// answers with an error or the request itself fails (timeout, DNS).
async function deliverQuoteRequest(payload: QuoteRequest): Promise<boolean> {
  try {
    if (await deliverToTelegram(payload)) {
      return true;
    }
  } catch (error) {
    console.error("Telegram delivery failed", errorMessage(error));
  }

  try {
    return await deliverToWebhook(payload);
  } catch (error) {
    console.error("Webhook delivery failed", errorMessage(error));
    return false;
  }
}

export async function POST(request: Request) {
  const retryAfter = checkRateLimit(request);

  if (retryAfter) {
    return contactResponse(request, "rate-limited", 429, {
      "Retry-After": String(retryAfter),
    });
  }

  const origin = request.headers.get("origin");

  if (
    process.env.NODE_ENV === "production" &&
    (!origin || !allowedRequestOrigins().has(origin))
  ) {
    return contactResponse(request, "invalid", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return contactResponse(request, "invalid", 413);
  }

  let body: Blob | null;

  try {
    body = await readBodyWithLimit(request, MAX_REQUEST_BYTES);
  } catch {
    return contactResponse(request, "invalid", 400);
  }

  if (!body) {
    return contactResponse(request, "invalid", 413);
  }

  let formData: FormData;

  try {
    formData = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return contactResponse(request, "invalid", 400);
  }

  // Silently accept honeypot submissions without delivering them.
  if (readField(formData, "website").trim()) {
    return contactResponse(request, "success", 200);
  }

  const parsed = quoteRequestSchema.safeParse({
    name: readField(formData, "name"),
    contact:
      readField(formData, "contact") || readField(formData, "email"),
    company: readField(formData, "company"),
    targetMarket: readField(formData, "targetMarket"),
    service: readField(formData, "service"),
    project: readField(formData, "project"),
    budget: readField(formData, "budget"),
    timeline: readField(formData, "timeline"),
    message: readField(formData, "message"),
    consent: readField(formData, "consent"),
  });

  if (!parsed.success) {
    return contactResponse(request, "invalid", 400);
  }

  const turnstileToken = readField(formData, "cf-turnstile-response").trim();
  const verification = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: TURNSTILE_ACTION,
    remoteIp: getClientIp(request.headers) ?? undefined,
  });

  if (!verification.ok) {
    console.warn("Turnstile verification rejected", {
      errorCodes: verification.errorCodes,
      hostname: verification.hostname,
      action: verification.action,
    });

    const verificationUnavailable = verification.errorCodes.some(
      (code) =>
        code === "missing-server-secret" ||
        code === "missing-allowed-hostnames" ||
        code === "siteverify-unavailable" ||
        code.startsWith("siteverify-http-"),
    );

    return contactResponse(
      request,
      verificationUnavailable ? "unavailable" : "verification",
      verificationUnavailable ? 503 : 400,
    );
  }

  const hasDeliveryConfig = Boolean(
    (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
      process.env.CONTACT_WEBHOOK_URL,
  );

  if (!hasDeliveryConfig) {
    return contactResponse(request, "unavailable", 503);
  }

  const delivered = await deliverQuoteRequest(parsed.data);

  return delivered
    ? contactResponse(request, "success", 200)
    : contactResponse(request, "error", 502);
}
