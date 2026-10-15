import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://localhost:3100");
const get = (route, options = {}) => fetch(new URL(route, base), { ...options, signal: AbortSignal.timeout(20_000) });
const routes = ["", "/services", "/games", "/casino-platforms", "/contact", "/privacy", "/docs"];
for (const locale of ["en", "es", "pt"]) {
  for (const path of routes) {
    const route = `/${locale}${path}`, response = await get(route), html = await response.text();
    assert.equal(response.status, 200, route);
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`), route);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${route}: one primary heading`);
    assert.match(html, /id="main-content"/);
    assert.match(html, new RegExp(`rel="canonical" href="https?:[^"<>]+/${locale}${path}"`));
    for (const alternative of ["en", "es", "pt", "x-default"]) assert.match(html, new RegExp(`hrefLang="${alternative}"`, "i"));
    if (path !== "/privacy") assert.match(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /"digest":"\d+"/, `${route}: server rendering error`);
  }
}
for(const [headers, expected] of [[{ "accept-language": "es-MX,es;q=.9,en;q=.6" }, "/es"], [{ cookie: "aurevia-language=pt", "accept-language": "en-US" }, "/pt"], [{ "accept-language": "fr-FR", "cf-ipcountry": "BR" }, "/pt"]]) {
  const response = await get("/", { headers, redirect: "manual" });
  assert.equal(response.status, 307); assert.equal(new URL(response.headers.get("location"), base).pathname, expected);
  assert.match(response.headers.get("cache-control"), /no-store/);
}
const legacy = await get("/games?ref=test", { redirect: "manual" });
assert.equal(legacy.status, 308); assert.equal(new URL(legacy.headers.get("location"), base).pathname, "/en/games");
assert.equal(new URL(legacy.headers.get("location"), base).search, "?ref=test");
// A 404 must be the branded page in the server HTML, not Next's empty error shell or
// its unbranded default, and in the URL's language (English outside a locale).
const notFoundTitles = { en: "Page not found", es: "Página no encontrada", pt: "Página não encontrada" };
for(const [route, locale] of [["/fr", "en"], ["/about", "en"], ["/missing-icon.png", "en"], ["/fr/contact", "en"], ["/en/not-a-page", "en"], ["/es/not-a-page", "es"], ["/pt/a/b", "pt"], ["/en/demo/nope", "en"], ["/es/demo/nope", "es"]]) {
  const response = await get(route), html = await response.text();
  assert.equal(response.status, 404, route);
  assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`), `${route}: localized 404 document`);
  assert.match(html, new RegExp(`<h1[^>]*>${notFoundTitles[locale]}</h1>`), `${route}: branded 404 heading in server HTML`);
  assert.match(html, new RegExp(`<title>${notFoundTitles[locale]} \\| Aurevia Gaming</title>`), `${route}: 404 title`);
  assert.match(html, /<header[\s>]/, `${route}: site header`); assert.match(html, /<footer[\s>]/, `${route}: site footer`);
  assert.match(html, /<meta name="robots" content="noindex"/, `${route}: noindex`);
  assert.doesNotMatch(html, /id="__next_error__"/, `${route}: empty error shell`);
}
const demo = await get("/es/demo/wildframes"), demoHtml = await demo.text();
assert.equal(demo.status, 200); assert.match(demoHtml, /<html[^>]+lang="es"/);
assert.match(demo.headers.get("cache-control"), /no-store/); assert.match(demo.headers.get("x-robots-tag"), /noindex/);
for(const status of ["constructor", "__proto__", "invalid&status=success"]) assert.equal((await get(`/es/contact?status=${status}`)).status, 200);
const sitemap = await (await get("/sitemap.xml")).text();
assert.equal([...sitemap.matchAll(/<loc>/g)].length, 21, "21 localized sitemap entries (run this check against production-mode metadata)");
assert.doesNotMatch(sitemap, /<lastmod>/, "No invented modification dates");
// These invalid payloads cannot pass validation or deliver an inquiry.
const invalid = await get("/api/contact", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded", Origin: base.origin }, body: "" });
assert.ok([400, 403].includes(invalid.status), "Invalid submissions rejected");
console.log("Verified 21 localized pages, metadata, sitemap, preference redirects, legacy redirects, branded localized 404s, demo pages, query edge cases and invalid form rejection.");
