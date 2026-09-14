import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import { loadModule } from "./load-module.mjs";
const { preferredLocale, localizedPath, locales } = loadModule("src/lib/i18n.ts");
const { getSiteContent, getUiContent, translate } = loadModule("src/content/localized-content.ts");
const { siteContent } = loadModule("src/content/site-content.ts");
const { uiContent } = loadModule("src/content/ui-content.ts");
const { translations } = loadModule("src/content/translations.ts");
const { createPageMetadata } = loadModule("src/lib/metadata.ts");

test("language negotiation respects saved preferences and weighted browser languages", () => {
  assert.equal(preferredLocale("pt", "es-MX,en;q=.9", "ES"), "pt");
  assert.equal(preferredLocale("bad", "es;q=.3,pt-BR;q=.8,en;q=.7", "ES"), "pt");
  assert.equal(preferredLocale(undefined, "en-US,es;q=.9", "MX"), "en");
  assert.equal(preferredLocale(undefined, "es;q=0,pt;q=NaN,en;q=2", "BR"), "pt");
  assert.equal(preferredLocale(undefined, "fr-FR", "MX"), "es");
  assert.equal(preferredLocale(undefined, "", "PT"), "pt");
  assert.equal(preferredLocale(undefined, "*", "XX"), "en");
});
test("switching languages preserves routes, query values and fragment identifiers", () => {
  assert.equal(localizedPath("/es/contact?project=Wild%20Frames#quote-form", "pt"), "/pt/contact?project=Wild%20Frames#quote-form");
  assert.equal(localizedPath("/", "en"), "/en");
  assert.equal(localizedPath("/en", "es"), "/es");
  assert.equal(localizedPath("https://aureviagaming.com/playngo-sandbox/lab/", "pt"), "https://aureviagaming.com/playngo-sandbox/lab/");
  assert.equal(localizedPath("#game-library", "es"), "#game-library");
});
test("localized forms keep API values stable and catalog identity unchanged", () => {
  for (const locale of locales) {
    const content = getSiteContent(locale);
    assert.deepEqual(content.contactPage.form.projectValues, siteContent.contactPage.form.projectTypes);
    assert.deepEqual(content.contactPage.form.budgetValues, siteContent.contactPage.form.budgetOptions);
    assert.equal(content.contactPage.form.locale, locale);
    assert.equal(content.gamesPage.catalog.games.length, 9);
    assert.deepEqual(content.gamesPage.catalog.games.map(game => game.id), siteContent.gamesPage.catalog.games.map(game => game.id));
    assert.equal(content.gamesPage.catalog.games[1].title, "Honey Rush");
    assert.equal(content.navigation[0].href, `/${locale}`);
  }
  assert.notEqual(getSiteContent("es").contactPage.form.projectTypes[0], siteContent.contactPage.form.projectTypes[0]);
  assert.equal(siteContent.contactPage.form.locale, "en", "translation must not mutate shared English content");
});
test("every presentation string is translated; technical identifiers remain stable", () => {
  const excludedKeys = new Set(["id", "src", "path", "icon", "tone", "category", "url", "href", "phoneDisplay", "telegramHandle", "telegramUrl", "whatsappHref", "number", "projectValues", "budgetValues", "locale", "keywords"]);
  const properNames = new Set(["Aurevia Gaming", "Aurevia", "Telegram", "Web · Android · iOS", "Wild Frames", "Honey Rush", "Moon Princess", "Wheel of Mictlan", "Secret of Dead", "Legacy of Egypt", "Hugo’s Adventure", "Troll Hunters 2", "Demon", "all", "grid-slots", "video-slots"]);
  function visit(value, key = "", location = "") {
    if (excludedKeys.has(key)) return;
    if (typeof value === "string" && value && !properNames.has(value) && !value.endsWith(" — Play’n GO game artwork")) assert.ok(Object.hasOwn(translations, value), `Missing translation: ${location}: ${value}`);
    else if (Array.isArray(value)) value.forEach((item,index) => visit(item,key,`${location}.${index}`));
    else if (value && typeof value === "object") Object.entries(value).forEach(([name,item]) => visit(item,name,`${location}.${name}`));
  }
  visit(siteContent); visit(uiContent);
  const privacy = readFileSync(new URL("../src/app/[locale]/privacy/page.tsx", import.meta.url), "utf8");
  for (const match of privacy.matchAll(/translate\("((?:[^"\\]|\\.)*)", locale\)/g)) assert.ok(Object.hasOwn(translations, JSON.parse(`"${match[1]}"`)), `Missing privacy translation: ${match[1]}`);
  assert.equal(getUiContent("pt").language, "Idioma");
  assert.notEqual(translate("Wild Frames — Play’n GO game artwork", "es"), "Wild Frames — Play’n GO game artwork");
});
test("all language versions have self canonicals and reciprocal alternates", () => {
  for(const locale of locales) {
    const metadata = createPageMetadata(getSiteContent(locale).seo.games, locale);
    assert.equal(metadata.alternates.canonical, `/${locale}/games`);
    for(const alternate of locales) assert.equal(metadata.alternates.languages[alternate], `/${alternate}/games`);
    assert.equal(metadata.alternates.languages["x-default"], "/en/games");
  }
});

test("interactive components do not leave untranslated text outside the dictionaries", () => {
  const properNames = new Set(["Google Analytics", "Website", "Telegram", "WhatsApp", "Play’n GO", "Aurevia Gaming", "AUREVIA GAMING", "EUR", "· 10,000 EUR"]);
  const root = new URL("../src/components/", import.meta.url);
  for (const file of readdirSync(root, { recursive: true }).filter(file => file.endsWith(".tsx"))) {
    const source = ts.createSourceFile(file, readFileSync(new URL(file.replaceAll("\\", "/"), root), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node) && /[a-zA-Z]{3}/.test(node.text)) assert.ok(properNames.has(node.text.trim()), `${file}: untranslated UI text: ${node.text.trim()}`);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
});
