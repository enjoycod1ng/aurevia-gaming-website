import { GameCard } from "@/components/games/game-card";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

export function HomeDemosSection({ content }: { content: SiteContent["home"]["demos"] }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((game) => <GameCard game={game} key={game.id} />)}
        </div>
      </div>
    </section>
  );
}
