import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createRequire } from "node:module";
import { loadModule } from "./load-module.mjs";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const { proxy } = loadModule("src/proxy.ts");
const { contentSecurityPolicy } = loadModule("src/lib/content-security-policy.ts");
const { themeInitScript } = loadModule("src/lib/theme.ts");
const { localeHeader } = loadModule("src/lib/i18n.ts");

const respond = (pathname) => proxy(new NextRequest(`https://aureviagaming.com${pathname}`));
const directive = (policy, name) => policy.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name} `));
const scriptNonce = (policy) => directive(policy, "script-src").match(/'nonce-([^']+)'/)?.[1];
const noncePages = ["/en/admin", "/es/admin", "/pt/admin", "/en/demo/wildframes", "/es/demo/honeyrush", "/pt/demo"];

function withEnv(t, values) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test("admin and demo pages get a nonce-based script policy that Next.js can apply", (t) => {
  withEnv(t, { NODE_ENV: "production", NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN: undefined });
  const themeHash = `'sha256-${createHash("sha256").update(themeInitScript).digest("base64")}'`;
  for (const pathname of noncePages) {
    const response = respond(pathname);
    const policy = response.headers.get("content-security-policy");
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.ok(policy, `${pathname}: response policy`);
    // Next.js takes the nonce from the request's policy when it renders the page.
    assert.equal(response.headers.get("x-middleware-request-content-security-policy"), policy, pathname);
    assert.equal(response.headers.get(`x-middleware-request-${localeHeader}`), pathname.split("/")[1], pathname);
    const nonce = scriptNonce(policy);
    assert.ok(nonce && Buffer.from(nonce, "base64").length >= 16, `${pathname}: 128-bit nonce`);
    const scripts = directive(policy, "script-src").split(" ");
    assert.ok(scripts.includes("'strict-dynamic'"), pathname);
    assert.ok(scripts.includes(themeHash), `${pathname}: SiteDocument's theme script is allowed by hash`);
    assert.ok(!scripts.includes("'unsafe-inline'"), `${pathname}: no inline scripts without the nonce`);
    assert.ok(!scripts.includes("'unsafe-eval'"), pathname);
    assert.equal(directive(policy, "frame-src"), "frame-src 'self' https://challenges.cloudflare.com", pathname);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.match(policy, /object-src 'none'/);
  }
});

test("every admin and demo response gets a fresh nonce", () => {
  const nonces = new Set();
  for (let index = 0; index < 20; index++) {
    for (const pathname of ["/en/admin", "/en/demo/wildframes"]) {
      nonces.add(scriptNonce(respond(pathname).headers.get("content-security-policy")));
    }
  }
  assert.equal(nonces.size, 40);
  assert.ok(![...nonces].includes(undefined));
});

test("development keeps eval for React's debugging, still without inline scripts", (t) => {
  withEnv(t, { NODE_ENV: "development" });
  const scripts = directive(respond("/en/admin").headers.get("content-security-policy"), "script-src").split(" ");
  assert.ok(scripts.includes("'unsafe-eval'"));
  assert.ok(!scripts.includes("'unsafe-inline'"));
});

test("demo pages can frame a separate runtime origin", (t) => {
  withEnv(t, { NODE_ENV: "production", NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN: "https://play.aureviagaming.com" });
  const policy = respond("/en/demo/wildframes").headers.get("content-security-policy");
  assert.equal(directive(policy, "frame-src"), "frame-src 'self' https://challenges.cloudflare.com https://play.aureviagaming.com");
  assert.equal(directive(contentSecurityPolicy(), "frame-src"), directive(policy, "frame-src"), "same frame sources as the site policy");
});

test("marketing routes keep the next.config.ts policy", async (t) => {
  withEnv(t, { NODE_ENV: "production", NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN: undefined });
  for (const pathname of ["/en", "/es/services", "/pt/games", "/en/casino-platforms", "/en/contact", "/es/privacy", "/en/docs", "/en/not-a-page", "/en/administrator", "/en/demos", "/en/games/demo"]) {
    const response = respond(pathname);
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.equal(response.headers.get("content-security-policy"), null, `${pathname}: no proxy policy`);
    assert.equal(response.headers.get("x-middleware-request-content-security-policy"), null, pathname);
  }
  // The policy every route had before admin and demo pages got a nonce, plus GA4's
  // *.analytics.google.com collection endpoint.
  assert.equal(contentSecurityPolicy(), [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
    "media-src 'self'",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "));
  const { default: nextConfig } = loadModule("next.config.ts");
  const siteHeaders = (await nextConfig.headers()).find((rule) => rule.source === "/:path*").headers;
  assert.deepEqual(siteHeaders.filter((header) => header.key.toLowerCase() === "content-security-policy"), [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  ]);
});
