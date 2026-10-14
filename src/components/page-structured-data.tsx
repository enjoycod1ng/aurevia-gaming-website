import { JsonLd } from "./json-ld";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { SiteContent } from "@/types/content";

export function PageStructuredData({ content, page, locale }: { content: SiteContent; page: keyof SiteContent["seo"]; locale: Locale }) {
  const entry = content.seo[page], base = content.brand.url;
  const url = new URL(localizedPath(entry.path, locale), base).href;
  const graph: object[] = [{ "@type": "WebPage", "@id": `${url}#webpage`, url, name: entry.title, description: entry.description, inLanguage: locale, isPartOf: { "@id": `${base}/#website` }, about: { "@id": `${base}/#organization` } }, { "@type": "WebSite", "@id": `${base}/#website`, url: base, name: content.brand.name, inLanguage: ["en", "es", "pt"], publisher: { "@id": `${base}/#organization` } }];
  if (page !== "home") graph.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: content.navigation[0].label, item: new URL(localizedPath("/", locale), base).href }, { "@type": "ListItem", position: 2, name: entry.title, item: url }] });
  if (page === "services") graph.push(...content.servicesPage.offerings.items.map(service => ({ "@type": "Service", "@id": `${url}#${service.id}`, name: service.title, description: service.description, url: `${url}#${service.id}`, provider: { "@id": `${base}/#organization` } })));
  if (page === "games") graph.push({ "@type": "ItemList", name: content.gamesPage.catalog.title, numberOfItems: content.gamesPage.catalog.games.length, itemListElement: content.gamesPage.catalog.games.map((game, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "VideoGame", name: game.title, description: game.description, url: `${url}#${game.id}`, image: new URL(game.image.src, base).href, publisher: { "@type": "Organization", name: "Play’n GO" } } })) });
  if (page === "contact") graph.push({ "@type": "FAQPage", mainEntity: content.contactPage.brief.questions.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}
