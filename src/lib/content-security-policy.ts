import { createHash, randomBytes } from "node:crypto";
// Relative imports: next.config.ts loads this module and cannot resolve "@/".
import { separateDemoRuntimeOrigin } from "./demo-runtime";
import { themeInitScript } from "./theme";

const turnstileOrigin = "https://challenges.cloudflare.com";
const tagManagerOrigin = "https://www.googletagmanager.com";
// SiteDocument writes this inline script itself, so Next.js never adds the nonce to it.
const themeScriptHash = `'sha256-${createHash("sha256").update(themeInitScript).digest("base64")}'`;

export function createNonce(): string {
  return randomBytes(16).toString("base64");
}

/** Without a nonce: next.config.ts sends this to every route, because the inline
 * scripts in statically prerendered pages cannot carry a per-request nonce.
 * With one: src/proxy.ts sends it on admin and demo pages, which render per request.
 * 'strict-dynamic' then trusts only scripts that carry the nonce (Next.js adds it to
 * its own) and the scripts they load, such as Turnstile and GA after a client-side
 * navigation; browsers without 'strict-dynamic' fall back to the listed hosts.
 * The other directives match, so those navigations keep working. */
export function contentSecurityPolicy(nonce?: string): string {
  const production = process.env.NODE_ENV === "production";
  const scriptSources = nonce
    ? ["'self'", `'nonce-${nonce}'`, themeScriptHash, "'strict-dynamic'", turnstileOrigin, tagManagerOrigin]
    : ["'self'", "'unsafe-inline'", turnstileOrigin, tagManagerOrigin];
  if (!production) scriptSources.push("'unsafe-eval'");
  // A separate demo runtime origin (src/lib/demo-runtime.ts) must be frameable.
  const demoRuntimeOrigin = separateDemoRuntimeOrigin();
  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com",
    "font-src 'self' data:",
    `connect-src 'self' ${turnstileOrigin} https://*.google-analytics.com ${tagManagerOrigin}`,
    "media-src 'self'",
    `frame-src 'self' ${turnstileOrigin}${demoRuntimeOrigin ? ` ${demoRuntimeOrigin}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    production ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
