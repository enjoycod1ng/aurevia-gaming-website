import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-module.mjs";

const { GET, POST } = loadModule("src/app/api/portal/[...path]/route.ts");
const params = (path) => ({ params: Promise.resolve({ path }) });
function request(method = "GET", body) {
  return Object.assign(
    new Request(
      "https://aureviagaming.com/api/portal/admin/me?start=2026-09-01",
      {
        method,
        body,
        headers: {
          Origin: "https://aureviagaming.com",
          Authorization: "Bearer unrelated-secret",
          "Content-Type": "application/json",
        },
      },
    ),
    {
      nextUrl: new URL(
        "https://aureviagaming.com/api/portal/admin/me?start=2026-09-01",
      ),
      cookies: {
        getAll: () => [
          { name: "__Host-aurevia_admin", value: "staff-session" },
          { name: "__Host-aurevia_demo", value: "visitor-session" },
          { name: "unrelated-account", value: "must-not-forward" },
        ],
      },
    },
  );
}

test("portal proxy isolates cookies, preserves CSRF origin and returns uncached sessions", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.search, "?start=2026-09-01");
    assert.match(url.pathname, /\/admin\/me$/);
    assert.equal(options.headers.get("origin"), "https://aureviagaming.com");
    assert.equal(options.headers.get("authorization"), null);
    assert.equal(
      options.headers.get("cookie"),
      "__Host-aurevia_admin=staff-session; __Host-aurevia_demo=visitor-session",
    );
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    return Response.json(
      { user: { role: "viewer" } },
      {
        headers: {
          "Set-Cookie":
            "__Host-aurevia_admin=renewed; Secure; HttpOnly; Path=/; SameSite=Strict",
          "X-Internal-Secret": "private",
        },
      },
    );
  });
  const result = await GET(request(), params(["admin", "me"]));
  assert.equal(result.status, 200);
  assert.match(result.headers.get("cache-control"), /no-store/);
  assert.match(result.headers.get("set-cookie"), /HttpOnly/);
  assert.equal(result.headers.get("x-internal-secret"), null);
});

test("portal proxy refuses path traversal and oversized bodies before contacting services", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("must not contact backend");
  });
  for (const path of [
    ["runtime", "wildframes"],
    ["admin", "..", "health"],
    ["demo", "%2fadmin"],
  ]) {
    assert.equal((await GET(request(), params(path))).status, 404);
  }
  assert.equal(
    (await POST(request("POST", "x".repeat(65537)), params(["admin", "login"])))
      .status,
    413,
  );
  assert.equal(fetch.mock.callCount(), 0);
});

test("portal backend failures expose a retryable response without internal addresses", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("private backend configuration");
  });
  const response = await GET(request(), params(["admin", "me"]));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("retry-after"), "5");
  assert.deepEqual(await response.json(), { error: "service_unavailable" });
});

test("all published game cards use direct demos and admin/demo dictionaries cover three locales", () => {
  const { preparedGames } = loadModule("src/content/prepared-games.ts");
  assert.equal(preparedGames.length, 9);
  for (const game of preparedGames) {
    assert.equal(game.primaryAction.href, `/demo/${game.id}`);
    assert.equal(game.primaryAction.label, "Open Demo");
  }
  for (const [file, name] of [
    ["admin", "getAdminCopy"],
    ["demo", "getDemoCopy"],
  ]) {
    const getCopy = loadModule(`src/content/${file}-copy.ts`)[name];
    const keys = Object.keys(getCopy("en"));
    for (const locale of ["en", "es", "pt"]) {
      const copy = getCopy(locale);
      assert.deepEqual(Object.keys(copy), keys);
      for (const value of Object.values(copy))
        assert.equal(typeof value === "string" && value.length > 0, true);
    }
  }
});
