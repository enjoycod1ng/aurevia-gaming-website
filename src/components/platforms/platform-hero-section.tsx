import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

import { PlatformMetricCard, PlatformSidebar } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";

type PlatformHeroContent = SiteContent["platformPage"]["hero"];

function OperatorOverview({ content }: { content: PlatformHeroContent["overview"] }) {
  const panel = (
    <aside className="grid min-h-152.5 grid-cols-1 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-panel sm:grid-cols-[134px_minmax(0,1fr)]" aria-label={content.ariaLabel}>
      <div className="hidden sm:block"><PlatformSidebar brandMark={content.brandMark} brandName={content.brandName} ariaLabel={content.navigationAriaLabel} items={content.navigation} compact /></div>
      <div className="min-w-0 p-4.5 sm:p-7">
        <header><h2 className="text-2xl leading-tight normal-case">{content.title}</h2><p className="mt-2 text-xs text-[#9ca4b0]">{content.description}</p></header>
        <div className="mt-6.5 grid grid-cols-1 gap-3 xs:grid-cols-3">{content.metrics.map((metric) => <PlatformMetricCard metric={metric} key={metric.label} />)}</div>
        <section className="mt-4 min-h-46.5 rounded-[14px] border border-[#293340] bg-surface px-4.5 py-4" aria-label={content.chartTitle}>
          <strong className="text-xs">{content.chartTitle}</strong>
          <div className="mt-2 flex h-33.5 items-end gap-1.5 bg-[repeating-linear-gradient(to_bottom,transparent_0_43px,#293340_44px_45px)] px-1.5 pt-3.5" aria-hidden="true">
            {content.chartBars.map((height, index) => <span className={`w-full max-h-30.5 rounded-t-md ${index >= content.chartBars.length - 3 ? "bg-gold-bright" : "bg-gold"}`} style={{ height }} key={`${height}-${index}`} />)}
          </div>
        </section>
        <section className="mt-4 rounded-[14px] border border-[#293340] bg-surface px-4.5 py-3.5">
          <strong className="text-xs">{content.productsTitle}</strong>
          <ul className="mt-2 list-none p-0">{content.products.map((product) => <li className="grid min-h-8 grid-cols-[1fr_auto] items-center gap-4 border-b border-[#293340] text-xs last:border-b-0 xs:grid-cols-[1fr_auto_auto]" key={product.name}><span>{product.name}</span><small className="hidden text-[#9ca4b0] xs:block">{product.players}</small><b className="text-success">{product.revenue}</b></li>)}</ul>
        </section>
      </div>
    </aside>
  );

  return <PlatformVisual image={content.image} className="w-full justify-self-center" sizes="(max-width: 900px) 100vw, 52vw" priority>{panel}</PlatformVisual>;
}

export function PlatformHeroSection({ content }: { content: PlatformHeroContent }) {
  return (
    <section className="scroll-reveal relative flex min-h-[calc(100svh-6rem)] items-center py-16 after:pointer-events-none after:absolute after:-top-32.5 after:-right-30 after:size-165 after:rounded-full after:bg-[radial-gradient(circle,rgb(212_175_55/0.12),transparent_69%)]" data-scroll-reveal>
      <div className="container relative z-1 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.84fr)_minmax(500px,1.16fr)] xl:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)] xl:gap-19">
        <div className="min-w-0 max-w-190">
          <p className="mb-9 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-5 text-xs font-bold text-gold-bright uppercase">{content.label}</p>
          <h1 className="max-w-162.5 text-5xl leading-[1.04] uppercase md:text-6xl xl:text-7xl">{content.titleLines.map((line) => <span className="block max-sm:inline" key={line}>{line} </span>)}</h1>
          <p className="mt-7 max-w-165 text-base leading-7 text-muted">{content.description}</p>
          <div className="mt-10 flex flex-col gap-4 xs:flex-row"><ButtonLink href={content.primaryAction.href} external={content.primaryAction.external} ariaLabel={content.primaryAction.ariaLabel}>{content.primaryAction.label}</ButtonLink><ButtonLink href={content.secondaryAction.href} external={content.secondaryAction.external} ariaLabel={content.secondaryAction.ariaLabel} variant="secondary">{content.secondaryAction.label}</ButtonLink></div>
        </div>
        <OperatorOverview content={content.overview} />
      </div>
    </section>
  );
}
