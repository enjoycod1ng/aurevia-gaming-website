import { CtaBand } from "@/components/cta-band";
import { MediaFrame } from "@/components/media-frame";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.platforms);

export default function CasinoPlatformsPage() {
  return (
    <main id="main-content">
      <PageHero
        label={siteContent.platformPage.label}
        title={siteContent.platformPage.title}
        description={siteContent.platformPage.description}
        primaryAction={siteContent.primaryCta}
        secondaryAction={siteContent.secondaryCta}
      />

      <section className="section section--tight-top">
        <div className="container platform-feature">
          <MediaFrame
            image={siteContent.platformPage.image}
            sizes="(max-width: 900px) 100vw, 62vw"
            preload
          />
          <div className="platform-feature__aside">
            <p className="eyebrow">Built for ownership</p>
            <h2>Control the operating model and the codebase.</h2>
            <ul className="check-list">
              {siteContent.platformPage.differentiators.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--surface section--content-visibility">
        <div className="container">
          <SectionHeading
            label="Platform architecture"
            title={siteContent.platformPage.modulesHeading}
            description="Start with the modules the operation needs now, while keeping the boundaries clear enough to extend later."
            align="center"
          />
          <div className="module-grid">
            {siteContent.platformPage.modules.map((module, index) => (
              <article className="module-card" key={module.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Map the platform around your actual providers and workflows."
        description="Share the existing stack, required modules and integration constraints so the architecture starts from reality."
      />
    </main>
  );
}
