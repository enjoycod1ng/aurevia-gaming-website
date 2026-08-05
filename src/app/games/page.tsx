import { GameCatalogSection } from "@/components/games/game-catalog-section";
import { GamesCtaSection } from "@/components/games/games-cta-section";
import { GamesDeliverySection } from "@/components/games/games-delivery-section";
import { GamesDeploymentSection } from "@/components/games/games-deployment-section";
import { GamesHeroSection } from "@/components/games/games-hero-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

import styles from "@/components/games/games-page.module.css";

export const metadata = createPageMetadata(siteContent.seo.games);

export default function GamesPage() {
  const { contact, gamesPage } = siteContent;

  return (
    <main id="main-content" className={styles.page}>
      <GamesHeroSection content={gamesPage.hero} />
      <GameCatalogSection content={gamesPage.catalog} />
      <GamesDeliverySection content={gamesPage.delivery} />
      <GamesDeploymentSection content={gamesPage.deployment} />
      <GamesCtaSection content={gamesPage.cta} contact={contact} />
    </main>
  );
}
