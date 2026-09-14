import { GameCatalogSection } from "@/components/games/game-catalog-section";
import { GamesHeroSection } from "@/components/games/games-hero-section";
import { getSiteContent, requireLocale } from "@/content/localized-content";
import { PageStructuredData } from "@/components/page-structured-data";
import { createPageMetadata } from "@/lib/metadata";

import { HomeCtaSection } from "@/components/home/home-cta-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata(getSiteContent(locale).seo.games, locale);
}

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const siteContent = getSiteContent(locale);
  const { gamesPage } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden bg-canvas">
      <PageStructuredData content={siteContent} page="games" locale={locale} />
      <GamesHeroSection content={gamesPage.hero} />
      <GameCatalogSection content={gamesPage.catalog} />
      <HomeCtaSection
        content={gamesPage.cta}
      />
    </main>
  );
}
