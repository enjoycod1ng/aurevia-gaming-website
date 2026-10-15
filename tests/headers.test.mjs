import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-module.mjs";

const { default: nextConfig } = loadModule("next.config.ts");

test("every route sends HSTS for this host only", async () => {
  const site = (await nextConfig.headers()).find((rule) => rule.source === "/:path*").headers;
  assert.deepEqual(site.filter((header) => header.key.toLowerCase() === "strict-transport-security"), [
    { key: "Strict-Transport-Security", value: "max-age=31536000" },
  ]);
});

test("prerendered pages revalidate on every request and keep no-transform", async () => {
  const rules = await nextConfig.headers();
  for (const page of ["", "/services", "/games", "/casino-platforms", "/privacy", "/docs"]) {
    const rule = rules.find((candidate) => candidate.source === `/:locale(en|es|pt)${page}`);
    assert.ok(rule, `${page || "/"}: cache rule`);
    assert.equal(
      rule.headers.find((header) => header.key === "Cache-Control")?.value,
      "public, max-age=0, must-revalidate, no-transform",
      page || "/",
    );
  }
});
