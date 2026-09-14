import type { MetadataRoute } from "next";
import { siteContent } from "@/content/site-content";
import { locales, localizedPath } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.APP_ENV === "staging") return [];
  const routes = [...siteContent.navigation.map(item => item.href), "/privacy"];
  return routes.flatMap(path => locales.map(locale => ({
    url: new URL(localizedPath(path, locale), siteContent.brand.url).href,
    alternates: { languages: Object.fromEntries([...locales.map(language => [language, new URL(localizedPath(path, language), siteContent.brand.url).href]), ["x-default", new URL(localizedPath(path, "en"), siteContent.brand.url).href]]) },
  })));
}
