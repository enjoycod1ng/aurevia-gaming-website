import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const archive = process.argv[2];
if (!archive) throw new Error("Usage: npm run release:verify -- <archive.tar.gz>");

const tempRoot = path.resolve(tmpdir());
const directory = await mkdtemp(path.join(tempRoot, "aurevia-release-"));
const socket = createServer();
let server;
let stopped;
let log = "";

try {
  execFileSync("tar", ["-xzf", path.resolve(archive), "-C", directory], { stdio: "pipe" });
  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", resolve);
  });
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const revision = process.env.GITHUB_SHA ?? "0".repeat(40);
  const environment = process.env.APP_ENV ?? "staging";
  server = spawn(process.execPath, ["server.js"], {
    cwd: directory,
    env: {
      ...process.env,
      NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: String(port),
      APP_REVISION: revision, APP_ENV: environment,
      // Verification never delivers contact messages.
      TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "", CONTACT_WEBHOOK_URL: "",
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  stopped = once(server, "close");
  server.stdout.on("data", (chunk) => { log = (log + chunk).slice(-8000); });
  server.stderr.on("data", (chunk) => { log = (log + chunk).slice(-8000); });

  const get = (url, options) => fetch(new URL(url, base), {
    ...options, signal: AbortSignal.timeout(10_000),
  });
  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("Standalone server exited before readiness");
    try {
      const response = await get("/api/health");
      if (response.ok) {
        const health = await response.json();
        assert.equal(health.revision, revision);
        assert.equal(health.environment, environment);
        healthy = true;
        break;
      }
    } catch { /* Allow startup to finish. */ }
    await delay(250);
  }
  assert.ok(healthy, "Standalone health check timed out");

  const assets = new Set([
    "/logo.svg", "/opengraph-image.png", "/favicon.ico", "/apple-touch-icon.png",
    "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png",
  ]);
  let canonical;
  for (const route of [
    "/", "/services", "/games", "/casino-platforms", "/contact", "/privacy",
    ...["en", "es", "pt"].flatMap(locale => ["", "/services", "/games", "/casino-platforms", "/contact", "/privacy", "/docs"].map(path => `/${locale}${path}`)),
    "/contact?status=constructor", "/contact?status=__proto__",
    "/contact?status=invalid&status=success&project=Slots&project=Casino",
  ]) {
    const response = await get(route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /id="main-content"/, route);
    const locale = route.match(/^\/(en|es|pt)(?:\/|$)/)?.[1];
    if (locale) {
      assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`));
      for (const language of ["en", "es", "pt"]) assert.match(html, new RegExp(`hrefLang="${language}"`, "i"));
    }
    if (route === "/") {
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      assert.equal(title, "Casino Game Development Agency | Aurevia Gaming");
      canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    }
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = match[1].replaceAll("&amp;", "&");
      if (url.startsWith("/_next/") || url.startsWith("/media/") || url.startsWith("/developer-downloads/")) assets.add(url);
    }
  }
  // src/proxy.ts replaces the next.config.ts policy on admin and demo pages with a
  // nonce-based one. A prerendered page would carry no nonce and fail in the browser.
  const scriptSources = (response) => (response.headers.get("content-security-policy") ?? "")
    .split(";").map((directive) => directive.trim()).find((directive) => directive.startsWith("script-src ")) ?? "";
  const nonces = new Set();
  for (const route of ["/en/admin", "/es/demo/wildframes", "/en/admin", "/es/demo/wildframes"]) {
    const response = await get(route);
    assert.equal(response.status, 200, route);
    // fetch joins repeated headers with ", ", and a policy has no commas.
    assert.doesNotMatch(response.headers.get("content-security-policy") ?? "", /,/, `${route}: one Content-Security-Policy header`);
    const sources = scriptSources(response);
    assert.doesNotMatch(sources, /'unsafe-inline'/, route);
    const nonce = sources.match(/'nonce-([^']+)'/)?.[1];
    assert.ok(nonce, `${route}: nonce`);
    nonces.add(nonce);
    const scripts = [...(await response.text()).matchAll(/<script\b[^>]*>/g)].map(([tag]) => tag);
    assert.deepEqual(
      scripts.filter((tag) => !tag.includes(` nonce="${nonce}"`) && !tag.includes('type="application/ld+json"')),
      ["<script>"],
      `${route}: every script but the hashed theme script carries the nonce`,
    );
  }
  assert.equal(nonces.size, 4, "Each response has its own nonce");
  const home = await get("/en");
  assert.match(scriptSources(home), /'unsafe-inline'/, "Prerendered pages keep the site policy");
  assert.doesNotMatch(scriptSources(home), /'nonce-/);
  await home.arrayBuffer();
  for (const asset of assets) {
    const response = await get(asset);
    assert.equal(response.status, 200, `Missing release asset: ${asset}`);
    await response.arrayBuffer();
  }
  const image = await get("/_next/image?url=%2Fmedia%2Fgames%2Fwildframes.webp&w=384&q=80", {
    headers: { Accept: "image/webp" },
  });
  assert.equal(image.status, 200, "Native Sharp image optimization");
  assert.match(image.headers.get("content-type"), /^image\//);
  await image.arrayBuffer();

  for (const route of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"]) {
    const response = await get(route);
    assert.equal(response.status, 200, route);
    await response.text();
  }
  assert.equal((await get("/does-not-exist")).status, 404);
  // Nginx sends these headers on every request. With them, a src/proxy.ts rewrite
  // once turned unknown games into a 500 (an external fetch to the app's own port).
  const behindNginx = { host: new URL(canonical).host, "x-forwarded-proto": "https" };
  for (const route of ["/en/demo/nope", "/es/demo/wildframesx"]) {
    const response = await get(route, { headers: behindNginx });
    assert.equal(response.status, 404, `${route} behind Nginx`);
    assert.match(await response.text(), /<h1[^>]*>(?:Page not found|Página no encontrada)<\/h1>/, `${route}: branded 404`);
  }
  const respelled = await get("/es/demo/WildFrames", { headers: behindNginx, redirect: "manual" });
  assert.equal(respelled.status, 308, "Other spellings of a game redirect");
  assert.equal(new URL(respelled.headers.get("location"), base).pathname, "/es/demo/wildframes");
  const invalid = await get("/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json", Origin: new URL(canonical).origin,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "",
  });
  assert.equal(invalid.status, 400, "Invalid contact submissions must be rejected");
  console.log(`Release verified: routes, query edge cases, ${assets.size} assets, metadata, admin and demo CSP nonces, unknown-game 404s behind Nginx, contact validation and Sharp.`);
} catch (error) {
  console.error(log);
  throw error;
} finally {
  if (socket.listening) await new Promise((resolve) => socket.close(resolve));
  if (server && server.exitCode === null) server.kill();
  if (stopped) await stopped;
  if (path.dirname(directory) !== tempRoot || !path.basename(directory).startsWith("aurevia-release-")) {
    throw new Error("Unexpected release verification directory");
  }
  await rm(directory, { recursive: true, force: true });
}
