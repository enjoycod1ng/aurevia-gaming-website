import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { loadModule } from "./load-module.mjs";

const require = createRequire(import.meta.url);
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match");
const { prepareDestination } = require("next/dist/shared/lib/router/utils/prepare-destination");
const { NextRequest } = require("next/server");
const { default: nextConfig } = loadModule("next.config.ts");
const { proxy } = loadModule("src/proxy.ts");
const { localeHeader } = loadModule("src/lib/i18n.ts");

test("paths outside a locale are rewritten to an unmatched English path after public files", async () => {
  const [rule] = (await nextConfig.rewrites()).afterFiles;
  const match = getPathMatch(rule.source, { removeUnnamedParams: true, strict: true });
  const destination = (pathname) => {
    const params = match(pathname);
    return params && prepareDestination({ appendParamsToQuery: false, destination: rule.destination, params, query: {} }).newUrl;
  };
  assert.equal(destination("/about"), "/en/_unmatched/about");
  assert.equal(destination("/fr/services"), "/en/_unmatched/fr/services");
  assert.equal(destination("/apple-touch-icon.png"), "/en/_unmatched/apple-touch-icon.png");
  assert.equal(destination("/demo/wildframes"), "/en/_unmatched/demo/wildframes", "never a real demo page at an unprefixed URL");
  assert.equal(destination("/english"), "/en/_unmatched/english");
  for (const pathname of ["/en", "/es/services", "/pt/demo/wildframes", "/en/not-a-page", "/api/contact", "/api/portal/demo/sessions", "/_next/static/chunks/missing.js"]) {
    assert.equal(match(pathname), false, `${pathname} must keep its own routing`);
  }
});

test("the proxy tags locale paths with the URL's locale for the global 404", () => {
  for (const [pathname, locale] of [["/es/not-a-page", "es"], ["/pt", "pt"], ["/en/demo/nope", "en"]]) {
    const response = proxy(new NextRequest(`https://aureviagaming.com${pathname}`, { headers: { [localeHeader]: "pt-spoofed" } }));
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.equal(response.headers.get(`x-middleware-request-${localeHeader}`), locale, pathname);
  }
  const negotiated = proxy(new NextRequest("https://aureviagaming.com/", { headers: { "accept-language": "es-MX" } }));
  assert.equal(negotiated.status, 307);
  assert.equal(new URL(negotiated.headers.get("location")).pathname, "/es");
  const legacy = proxy(new NextRequest("https://aureviagaming.com/games?ref=test"));
  assert.equal(legacy.status, 308);
  assert.equal(new URL(legacy.headers.get("location")).pathname, "/en/games");
});
