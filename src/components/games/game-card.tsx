import Image from "next/image";

import { ButtonLink } from "@/components/button-link";
import type { GameCatalogItem } from "@/types/content";

export function GameCard({ game }: { game: GameCatalogItem }) {
  return (
    <article className="scroll-reveal flex scroll-mt-28 flex-col overflow-hidden rounded-[22px] border border-line bg-surface" data-scroll-reveal id={game.id}>
      <Image className="aspect-10/7 h-auto w-full object-contain" src={game.image.src} alt={game.image.alt} width={game.image.width} height={game.image.height} quality={80} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 44vw, 28vw" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm font-bold tracking-wide text-gold-bright uppercase">Play’n GO <span className="px-1 text-muted" aria-hidden="true">/</span> {game.categoryLabel}</p>
        <h3 className="mt-3 text-xl leading-tight">{game.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{game.description}</p>
        <div className="mt-auto grid grid-cols-1 gap-3 pt-6 xs:grid-cols-2 [&_a]:min-h-12 [&_a]:px-3 [&_a]:text-sm">
          <ButtonLink href={game.primaryAction.href} external={game.primaryAction.external} ariaLabel={`${game.primaryAction.label}: ${game.title}`} analyticsEvent="demo_request_click" analyticsLabel={game.id}>{game.primaryAction.label}</ButtonLink>
          <ButtonLink href={game.secondaryAction.href} variant="secondary" ariaLabel={`${game.secondaryAction.label}: ${game.title}`}>{game.secondaryAction.label}</ButtonLink>
        </div>
      </div>
    </article>
  );
}
