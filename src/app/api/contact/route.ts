import { NextResponse } from "next/server";

import { siteContent } from "@/content/site-content";

export const runtime = "nodejs";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

interface QuoteRequest {
  name: string;
  email: string;
  company: string;
  service: string;
  project: string;
  message: string;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();

  if (rateLimitStore.size > 5000) {
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const current = rateLimitStore.get(clientIp);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(clientIp, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function readField(formData: FormData, field: string, maxLength: number): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectToContact(request: Request, status: string) {
  const url = new URL("/contact", request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, 303);
}

function formatMessage(payload: QuoteRequest): string {
  return [
    "New Aurevia Gaming project request",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company || "Not provided"}`,
    `Service: ${payload.service}`,
    `Project: ${payload.project || "Not provided"}`,
    "",
    "Brief:",
    payload.message
  ].join("\n");
}

async function deliverToTelegram(payload: QuoteRequest): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatMessage(payload),
      disable_web_page_preview: true
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store"
  });

  return response.ok;
}

async function deliverToWebhook(payload: QuoteRequest): Promise<boolean> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const bearerToken = process.env.CONTACT_WEBHOOK_BEARER_TOKEN;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {})
    },
    body: JSON.stringify({
      source: siteContent.brand.url,
      submittedAt: new Date().toISOString(),
      ...payload
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store"
  });

  return response.ok;
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return redirectToContact(request, "rate-limited");
  }

  const origin = request.headers.get("origin");
  const canonicalOrigin = new URL(siteContent.brand.url).origin;
  const allowedOrigins = new Set([canonicalOrigin, canonicalOrigin.replace("://", "://www.")]);

  if (process.env.NODE_ENV === "production" && origin && !allowedOrigins.has(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData();

  // Honeypot submissions are accepted silently to avoid teaching bots how they were detected.
  if (readField(formData, "website", 200)) {
    return redirectToContact(request, "success");
  }

  const payload: QuoteRequest = {
    name: readField(formData, "name", 100),
    email: readField(formData, "email", 160),
    company: readField(formData, "company", 140),
    service: readField(formData, "service", 120),
    project: readField(formData, "project", 120),
    message: readField(formData, "message", 4000)
  };
  const consent = readField(formData, "consent", 20);

  if (
    payload.name.length < 2 ||
    !isValidEmail(payload.email) ||
    payload.service.length < 2 ||
    payload.message.length < 20 ||
    consent !== "accepted"
  ) {
    return redirectToContact(request, "invalid");
  }

  const hasDeliveryConfig = Boolean(
    (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
      process.env.CONTACT_WEBHOOK_URL
  );

  if (!hasDeliveryConfig) {
    return redirectToContact(request, "unavailable");
  }

  try {
    const telegramDelivered = await deliverToTelegram(payload);
    const webhookDelivered = telegramDelivered ? false : await deliverToWebhook(payload);

    return redirectToContact(request, telegramDelivered || webhookDelivered ? "success" : "error");
  } catch {
    return redirectToContact(request, "error");
  }
}
