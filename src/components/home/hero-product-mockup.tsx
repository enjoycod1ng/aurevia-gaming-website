import type { SiteContent } from "@/types/content";

type HeroMockupContent = SiteContent["home"]["hero"]["mockup"];

export function HeroProductMockup({ content }: { content: HeroMockupContent }) {
  return (
    <div className="w-full overflow-hidden rounded-[26px] border border-line bg-surface-strong px-4.5 py-5.5 shadow-panel sm:px-8 sm:py-9 xl:px-11.5 xl:py-13.5" aria-label={content.ariaLabel}>
      <div className="relative min-h-96 rounded-[22px] border border-[#6f5518] bg-[radial-gradient(circle_at_45%_48%,rgb(212_175_55/0.18),transparent_38%),#2f260c] px-4.5 py-9 sm:min-h-105 sm:px-7.5 sm:py-12 xl:min-h-125 xl:px-10.5 xl:py-13.5">
        <div className="grid justify-items-center gap-3 font-display leading-none text-gold-soft uppercase">
          <span className="text-lg font-extrabold sm:text-2xl">{content.title}</span>
          <small className="text-xs font-bold text-gold-bright">{content.subtitle}</small>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 rounded-[15px] border-2 border-[#6f330e] bg-[#0a0e14] p-3 sm:mt-11" aria-hidden="true">
          {content.reels.map((reel, index) => (
            <span
              className={`grid min-h-12 place-items-center rounded-lg border text-base font-extrabold ${reel.active ? "border-gold bg-[#3d2f0d] text-gold-soft" : "border-[#2c3440] bg-[#171d27] text-ink"}`}
              key={`${reel.symbol}-${index}`}
            >
              {reel.symbol}
            </span>
          ))}
        </div>
        <div className="relative mt-8 grid gap-2">
          <span className="text-xs font-bold text-muted uppercase">{content.jackpotLabel}</span>
          <strong className="font-display text-2xl leading-none">{content.jackpotValue}</strong>
          <i className="absolute right-0 bottom-0 size-10 rounded-full bg-gold-bright" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4.5 grid grid-cols-1 gap-4.5 sm:grid-cols-[1.15fr_0.85fr]">
        {content.metrics.map((metric) => (
          <div className="relative grid min-h-22 content-center gap-2 rounded-2xl border border-line-strong bg-[#171d27] px-5.5" key={metric.label}>
            <span className="text-xs font-bold text-muted uppercase">{metric.label}</span>
            <strong className="text-2xl leading-none first:text-success">{metric.value}</strong>
            {typeof metric.progress === "number" ? (
              <i
                className="absolute right-5.5 bottom-8 h-2 w-14.5 rounded-full bg-success"
                aria-hidden="true"
                style={{ width: `${Math.max(metric.progress * 0.58, 12)}px` }}
              />
            ) : null}
            {metric.change ? <small className="absolute right-4.5 bottom-4.5 text-xs font-bold text-success">{metric.change}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
