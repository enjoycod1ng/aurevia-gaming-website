import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { loadModule } from "./load-module.mjs";
const manifest = loadModule("src/content/media-manifest.json");
const { siteContent } = loadModule("src/content/site-content.ts");

test("versioned images match their original bytes, dimensions, and content hashes", async () => {
  for(const [source, entry] of Object.entries(manifest)) {
    const bytes = await readFile(new URL(`../public${entry.src}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, source);
    assert.ok(entry.src.includes(entry.sha256.slice(0,12)));
    assert.deepEqual(bytes, await readFile(new URL(`../public${source}`, import.meta.url)));
    const meta = await sharp(bytes).metadata();
    assert.equal(meta.width, entry.width); assert.equal(meta.height, entry.height);
  }
});
test("every content image uses a verified versioned URL and correct intrinsic size", () => {
  const assets = new Map(Object.values(manifest).map(entry => [entry.src, entry]));
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if ("src" in value) {
      const entry = assets.get(value.src);
      assert.ok(entry, value.src); assert.equal(value.width, entry.width); assert.equal(value.height, entry.height); assert.ok(value.alt);
    }
    Object.values(value).forEach(visit);
  }
  visit(siteContent);
});
