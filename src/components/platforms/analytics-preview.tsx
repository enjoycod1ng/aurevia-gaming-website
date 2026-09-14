import Image from "next/image";

import type { MediaAsset } from "@/types/content";

export function AnalyticsPreview({ image, compact = false, preload = false }: { image: MediaAsset; compact?: boolean; preload?: boolean }) {
  return (
    <figure className="min-w-0">
      <a className="group block overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-panel transition hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold" href={image.src} target="_blank" rel="noopener noreferrer" aria-label="Open the full-size admin analytics design preview (sample data, new tab)">
        <Image className="block h-auto w-full" src={image.src} alt={image.alt} width={image.width} height={image.height} quality={80} sizes={compact ? "(max-width: 1279px) 92vw, 52vw" : "92vw"} preload={preload} />
        <span className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-xs text-muted"><span>Analytics platform · Sample data</span><span className="text-gold-bright">View full size ↗</span></span>
      </a>
      <figcaption className="mt-4 text-xs leading-5 text-muted">{image.caption}</figcaption>
    </figure>
  );
}
