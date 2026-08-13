import { ButtonLink } from "@/components/button-link";
import { ServicesLayerPanel } from "@/components/services/services-layer-panel";
import type { SiteContent } from "@/types/content";

type ServicesHeroContent = SiteContent["servicesPage"]["hero"];

export function ServicesHeroSection({
  content,
}: {
  content: ServicesHeroContent;
}) {
  return (
    <>
      <section className="scroll-reveal flex min-h-[calc(100svh-6rem)] items-center border-b border-line bg-[radial-gradient(circle_at_88%_18%,rgb(212_175_55/0.1),transparent_29rem)] py-16 md:py-24" data-scroll-reveal>
        <div className="container grid grid-cols-1 items-center gap-13 lg:grid-cols-[minmax(0,1fr)_minmax(450px,0.95fr)] xl:grid-cols-[minmax(0,1fr)_minmax(500px,0.92fr)] xl:gap-20">
          <div className="max-w-170">
            <p className="mb-8 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">{content.label}</p>
            <h1 className="max-w-170 text-5xl leading-[1.05] uppercase md:text-6xl xl:text-7xl">{content.title}</h1>
            <p className="mt-8 max-w-165 text-base leading-[1.62] text-muted md:text-lg">{content.description}</p>
            <div className="mt-9 flex flex-col gap-3 xs:flex-row">
              <ButtonLink href={content.primaryAction.href}>
                {content.primaryAction.label}
              </ButtonLink>
              <ButtonLink
                href={content.secondaryAction.href}
                variant="secondary"
              >
                {content.secondaryAction.label}
              </ButtonLink>
            </div>
          </div>
          <ServicesLayerPanel
            ariaLabel={content.layersAriaLabel}
            layers={content.layers}
          />
        </div>
      </section>
    </>
  );
}
