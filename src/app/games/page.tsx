import { CtaBand } from "@/components/cta-band";
import { DemoCard } from "@/components/demo-card";
import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.demos);

export default function DemoGamesPage() {
  return (
    <main id="main-content">
      <PageHero
        label={siteContent.demosPage.label}
        title={siteContent.demosPage.title}
        description={siteContent.demosPage.description}
        primaryAction={siteContent.primaryCta}
      />

      <section className="section section--tight-top">
        <div className="container demo-grid demo-grid--all">
          {siteContent.demos.map((demo) => (
            <DemoCard demo={demo} key={demo.id} />
          ))}
        </div>
      </section>

      <CtaBand
        title="Have a mechanic or visual direction in mind?"
        description="Send the reference, target device and core gameplay requirements. We will turn that context into a scoped build plan."
      />
    </main>
  );
}
