import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const guide = JSON.parse(read("src/content/developer-guide.json"));
const examples = JSON.parse(read("src/content/developer-examples.json"));

test("developer guide has complete translations, stable sections and matching downloadable content", () => {
  function localized(value) {
    assert.deepEqual(Object.keys(value).sort(), ["en", "es", "pt"]);
    for (const locale of ["en", "es", "pt"]) assert.ok(value[locale].trim().length > 0);
    assert.notEqual(value.en, value.es);
    assert.notEqual(value.en, value.pt);
  }
  localized(guide.title); localized(guide.description);
  Object.values(guide.labels).forEach(localized);
  const ids = new Set();
  for (const section of guide.sections) {
    assert.match(section.id, /^[a-z]+$/); assert.ok(!ids.has(section.id)); ids.add(section.id);
    localized(section.title); section.paragraphs.forEach(localized);
  }
  assert.equal(ids.size, 13);
  assert.deepEqual(JSON.parse(read("public/developer-downloads/developer-guide.json")), guide);
  for (const locale of ["en", "es", "pt"]) {
    const html = read(`public/developer-downloads/GUIDE.${locale}.html`);
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    for (const id of ids) assert.ok(html.includes(`id="${id}"`));
  }
});

test("displayed examples exactly match downloadable source in four languages", () => {
  assert.deepEqual(examples.map(example => example.id), ["node", "php", "csharp", "java"]);
  for (const example of examples) {
    assert.deepEqual(example.samples.map(sample => sample.id), ["quickstart", "helper"]);
    for (const sample of example.samples) {
      assert.equal(sample.code, read(`public/developer-downloads/${sample.file}`));
      assert.doesNotMatch(sample.file, /\.\./);
      assert.ok(sample.code.includes("api/provider/v1/"));
    }
  }
});

test("documentation matches the published sandbox contract rather than promising unsupported game languages", () => {
  const api = JSON.parse(read("public/developer-downloads/provider-api.openapi.json"));
  assert.equal(api.info.version, guide.version);
  assert.deepEqual(api.components.schemas.LaunchRequest.properties.lang.enum, ["en"]);
  const text = JSON.stringify(guide);
  for (const route of ["games", "games/{symbol}", "launch-url", "transactions", "transactions/{transaction_id}", "sessions/{session_id}", "sessions/{session_id}/close"])
    assert.ok(text.includes(`/api/provider/v1/${route}`));
  for (const rule of ["Idempotency-Key", "idempotency_conflict", "original_transaction_id", "x-pp-signature", "Retry-After", "300", "65,536"])
    assert.ok(text.includes(rule), `Missing contract rule: ${rule}`);
});
