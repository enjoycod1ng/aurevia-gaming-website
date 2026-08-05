import { GameCatalogSection } from "@/components/games/game-catalog-section";
import { GamesHeroSection } from "@/components/games/games-hero-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

import styles from "@/components/games/games-page.module.css";
import { HomeCtaSection } from "@/components/home/home-cta-section";

export const metadata = createPageMetadata(siteContent.seo.games);

export default function GamesPage() {
  const { contact, gamesPage } = siteContent;

  return (
    <main id="main-content" className={styles.page}>
      <GamesHeroSection content={gamesPage.hero} />
      <GameCatalogSection content={gamesPage.catalog} />
      <HomeCtaSection
        className="games-page__cta"
        content={gamesPage.cta}
        contact={contact}
      />
    </main>
  );
}
