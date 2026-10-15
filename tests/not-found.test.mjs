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
const { demoGameIds } = loadModule("src/content/demo-games.ts");
const { preparedGames } = loadModule("src/content/prepared-games.ts");

// Matches a next.config.ts rewrite the way Next.js does (case-insensitive by default).
function rewriter(rule) {
  const match = getPathMatch(rule.source, { removeUnnamedParams: true, strict: true });
  const destination = (pathname) => {
    const params = match(pathname);
    return params && prepareDestination({ appendParamsToQuery: false, destination: rule.destination, params, query: {} }).newUrl;
  };
  return { match, destination };
}

test("unknown games are rewritten to the routed 404 before the demo page renders", async () => {
  assert.deepEqual([...demoGameIds], preparedGames.map(({ id }) => id), "demo-games.ts lists every prepared game");
  const [rule] = (await nextConfig.rewrites()).beforeFiles;
  const { match, destination } = rewriter(rule);
  assert.equal(destination("/en/demo/nope"), "/en/_unmatched/demo/nope");
  assert.equal(destination("/pt/demo/wildframesx"), "/pt/_unmatched/demo/wildframesx");
  assert.equal(destination("/es/demo/wild"), "/es/_unmatched/demo/wild");
  // Known games in any case reach the page, which redirects other spellings.
  for (const pathname of [...demoGameIds.map((id) => `/es/demo/${id}`), "/es/demo/Wildframes", "/en/demo/wildframes/extra", "/fr/demo/nope", "/en/demo"]) {
    assert.equal(match(pathname), false, `${pathname} must keep its own routing`);
  }
});

test("paths outside a locale are rewritten to an unmatched English path after public files", async () => {
  const [rule] = (await nextConfig.rewrites()).afterFiles;
  const { match, destination } = rewriter(rule);
  assert.equal(destination("/about"), "/en/_unmatched/about");
  assert.equal(destination("/fr/services"), "/en/_unmatched/fr/services");
  assert.equal(destination("/missing-icon.png"), "/en/_unmatched/missing-icon.png");
  assert.equal(destination("/demo/wildframes"), "/en/_unmatched/demo/wildframes", "never a real demo page at an unprefixed URL");
  assert.equal(destination("/english"), "/en/_unmatched/english");
  for (const pathname of ["/en", "/es/services", "/pt/demo/wildframes", "/en/not-a-page", "/api/contact", "/api/portal/demo/sessions", "/_next/static/chunks/missing.js"]) {
    assert.equal(match(pathname), false, `${pathname} must keep its own routing`);
  }
});

test("the proxy tags locale paths with the URL's locale for the global 404", () => {
  for (const [pathname, locale] of [["/es/not-a-page", "es"], ["/pt", "pt"], ["/en/demo", "en"], ["/es/demo/wildframes", "es"]]) {
    const response = proxy(new NextRequest(`https://aureviagaming.com${pathname}`, { headers: { [localeHeader]: "pt-spoofed" } }));
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.equal(response.headers.get(`x-middleware-request-${localeHeader}`), locale, pathname);
  }
  // Unknown games: never a proxy rewrite (behind Nginx it became an external fetch and
  // a 500); next.config.ts rewrites them, and the 404 keeps the site policy.
  for (const [pathname, locale] of [["/en/demo/nope", "en"], ["/es/demo/wildframesx", "es"]]) {
    const response = proxy(new NextRequest(`https://aureviagaming.com${pathname}?ref=1`, { headers: { "x-forwarded-proto": "https" } }));
    assert.equal(response.headers.get("x-middleware-rewrite"), null, pathname);
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.equal(response.headers.get(`x-middleware-request-${localeHeader}`), locale, pathname);
    assert.equal(response.headers.get("content-security-policy"), null, `${pathname}: the 404 keeps the site policy`);
  }
  const negotiated = proxy(new NextRequest("https://aureviagaming.com/", { headers: { "accept-language": "es-MX" } }));
  assert.equal(negotiated.status, 307);
  assert.equal(new URL(negotiated.headers.get("location")).pathname, "/es");
  const legacy = proxy(new NextRequest("https://aureviagaming.com/games?ref=test"));
  assert.equal(legacy.status, 308);
  assert.equal(new URL(legacy.headers.get("location")).pathname, "/en/games");
});
