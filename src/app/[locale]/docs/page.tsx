import guide from "@/content/developer-guide.json";
import { requireLocale } from "@/content/localized-content";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/json-ld";
import { DeveloperExamples } from "@/components/developer-examples";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata({ title: guide.labels.eyebrow[locale], description: guide.description[locale], path: "/docs", keywords: [] }, locale);
}

export default async function DeveloperDocsPage({ params }: Props) {
  const locale = requireLocale((await params).locale);
  const label = (key: keyof typeof guide.labels) => guide.labels[key][locale];
  const url = new URL(`/${locale}/docs`, siteContent.brand.url).href;
  const downloads = [
    ["providerSchema", "provider-api.openapi.json"], ["walletSchema", "wallet-callbacks.openapi.json"],
    ["postman", "playngo.postman_collection.json"],
  ] as const;
  const contents = <>
    <a className="docs-toc-link" href="#examples">{label("examples")}</a>
    {guide.sections.map(section => <a className="docs-toc-link" href={`#${section.id}`} key={section.id}>{section.title[locale]}</a>)}
    <a className="docs-toc-link" href="#downloads">{label("downloads")}</a>
  </>;
  return (
    <main id="main-content" className="bg-canvas">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "TechArticle", "@id": `${url}#article`, url,
        headline: guide.title[locale], description: guide.description[locale], inLanguage: locale,
        dateModified: guide.updated, author: { "@type": "Organization", name: siteContent.brand.name, url: siteContent.brand.url },
        about: { "@type": "SoftwareApplication", name: "Aurevia Gaming integration sandbox", applicationCategory: "DeveloperApplication", softwareVersion: guide.version },
        isPartOf: { "@id": `${siteContent.brand.url}/#website` } }} />
      <div className="container py-12 sm:py-20">
        <header className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-bright">{label("eyebrow")}</p>
          <h1 className="heading-1 mt-4">{guide.title[locale]}</h1>
          <p className="mt-6 text-lg text-ink-soft">{guide.description[locale]}</p>
          <p className="mt-4 text-sm text-muted">{label("updated")} {guide.version}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/developer-downloads/client-sandbox-integration.zip" className="button button-primary" download>{label("bundle")}</a>
            <a href="https://aureviagaming.com/playngo-sandbox/lab/" className="button button-secondary">{label("sandbox")}</a>
          </div>
        </header>
        <div className="mt-12 grid min-w-0 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-16">
          <aside className="min-w-0">
            <details className="rounded-2xl border border-line bg-surface px-5 lg:hidden">
              <summary className="min-h-14 cursor-pointer py-4 font-semibold">{label("contents")}</summary>
              <nav aria-label={label("contents")} className="pb-4">{contents}</nav>
            </details>
            <nav aria-label={label("contents")} className="hidden rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto">
              <p className="mb-3 font-semibold">{label("contents")}</p>
              {contents}
            </nav>
          </aside>
          <article className="min-w-0 space-y-12">
            <DeveloperExamples locale={locale} />
            {guide.sections.map(section => <section key={section.id} id={section.id} className="docs-section border-b border-line pb-10" aria-labelledby={`title-${section.id}`}>
              <h2 id={`title-${section.id}`} className="text-2xl font-semibold leading-snug text-ink sm:text-3xl">{section.title[locale]}</h2>
              {section.paragraphs.map((paragraph, index) => <p key={index} className="mt-5 break-words leading-relaxed text-ink-soft">{paragraph[locale]}</p>)}
              {section.code && <pre className="docs-code mt-6" tabIndex={0} aria-label={section.title[locale]}><code>{section.code}</code></pre>}
            </section>)}
            <section id="downloads" className="docs-section" aria-labelledby="downloads-title">
              <h2 id="downloads-title" className="text-2xl font-semibold">{label("downloads")}</h2>
              <ul className="mt-5 grid gap-3">
                {downloads.map(([key, file]) => <li key={file}><a className="docs-toc-link underline" href={`/developer-downloads/${file}`} download>{label(key)}</a></li>)}
                <li><a className="docs-toc-link underline" href={`/developer-downloads/GUIDE.${locale}.html`} download>{guide.labels.eyebrow[locale]} · HTML</a></li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
