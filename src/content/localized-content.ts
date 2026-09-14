import { notFound } from "next/navigation";
import { siteContent } from "./site-content";
import { translations } from "./translations";
import { uiContent } from "./ui-content";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";
import type { SiteContent } from "@/types/content";

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export function translate(text: string, locale: Locale): string {
  if (locale === "en") return text;
  const translated = translations[text]?.[locale === "es" ? 0 : 1];
  if (translated) return translated;
  return text.replace(" — Play’n GO game artwork", locale === "es" ? " — imagen del juego de Play’n GO" : " — imagem do jogo da Play’n GO");
}

/** Only presentation copy and internal navigation are localized. IDs, assets,
 * category values and SEO route keys remain independent of the display language.
 */
export function localizeContent<T>(value: T, locale: Locale, key = ""): T {
  if (typeof value === "string") {
    if (["id", "src", "path", "icon", "tone", "category", "url", "phoneDisplay", "telegramHandle", "number", "projectValues", "budgetValues", "locale"].includes(key)) return value;
    if (key === "href") return localizedPath(value, locale) as T;
    return translate(value, locale) as T;
  }
  if (Array.isArray(value)) return value.map((item) => localizeContent(item, locale, key)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, localizeContent(item, locale, name)])) as T;
  return value;
}

export function getSiteContent(locale: Locale): SiteContent { const content = localizeContent(siteContent, locale); content.contactPage.form.locale = locale; return content; }
export function getUiContent(locale: Locale) { return localizeContent(uiContent, locale); }
