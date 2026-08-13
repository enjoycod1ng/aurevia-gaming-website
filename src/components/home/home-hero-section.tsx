import { ButtonLink } from "@/components/button-link";
import { HeroProductMockup } from "@/components/home/hero-product-mockup";
import type { SiteContent } from "@/types/content";

type HomeHeroContent = SiteContent["home"]["hero"];

export function HomeHeroSection({ content }: { content: HomeHeroContent }) {
  return (
    <section className="relative flex min-h-[calc(100svh-6rem)] items-center overflow-hidden py-16 after:pointer-events-none after:absolute after:-top-42.5 after:-right-20 after:size-160 after:rounded-full after:bg-[radial-gradient(circle,rgb(212_175_55/0.1),transparent_68%)] max-md:min-h-0 md:py-19">
      <div className="container relative z-1 grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.88fr)] xl:grid-cols-2">
        <div className="max-w-190">
          <p className="mb-8 inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase md:mb-10.5">
            {content.label}
          </p>
          <h1 className="max-w-162.5 font-display text-5xl leading-[1.04] uppercase md:text-6xl xl:text-7xl">
            {content.title}
            <span className="block text-gold-bright">{content.highlightedTitle}</span>
          </h1>
          <p className="my-7.5 max-w-162.5 text-base leading-6 text-muted md:my-10 md:text-lg">
            {content.description}
          </p>
          <div className="flex flex-col gap-4.5 xs:flex-row">
            <ButtonLink href={content.primaryAction.href}>
              {content.primaryAction.label}
            </ButtonLink>
            <ButtonLink href={content.secondaryAction.href} variant="secondary">
              {content.secondaryAction.label}
            </ButtonLink>
          </div>
          <div
            className="mt-10.5 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-3 md:gap-8"
            aria-label={content.detailsAriaLabel}
          >
            {content.details.map((detail) => (
              <div key={detail.label}>
                <span className="text-sm font-extrabold text-gold-bright uppercase">{detail.label}</span>
                <p className="mt-2.5 text-sm leading-5 text-muted">{detail.value}</p>
              </div>
            ))}
          </div>
        </div>
        <HeroProductMockup content={content.mockup} />
      </div>
    </section>
  );
}
