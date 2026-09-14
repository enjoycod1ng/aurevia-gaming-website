import Image from "next/image";

import { ButtonLink } from "@/components/button-link";
import type { GamePreview as GamePreviewContent } from "@/types/content";

export function GamePreview({ content }: { content: GamePreviewContent }) {
  return (
    <figure className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/35 bg-surface shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <span className="text-xs font-bold tracking-wide text-gold-bright uppercase">{content.label}</span>
        <span className="inline-flex items-center gap-2 text-xs text-muted"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Sandbox capture</span>
      </div>
      <Image className="block h-auto w-full" src={content.image.src} alt={content.image.alt} width={content.image.width} height={content.image.height} sizes="(max-width: 1023px) 92vw, 46vw" quality={80} preload />
      <figcaption className="p-5 sm:p-7">
        <h2 className="text-2xl">{content.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{content.description}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 xs:grid-cols-2 [&_a]:px-4 [&_a]:text-xs">
          <ButtonLink href={content.primaryAction.href} external={content.primaryAction.external} analyticsEvent="demo_request_click" analyticsLabel={content.title}>{content.primaryAction.label}</ButtonLink>
          <ButtonLink href={content.secondaryAction.href} variant="secondary">{content.secondaryAction.label}</ButtonLink>
        </div>
      </figcaption>
    </figure>
  );
}
