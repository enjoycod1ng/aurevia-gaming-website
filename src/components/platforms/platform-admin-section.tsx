import { SectionHeading } from "@/components/section-heading";
import { AnalyticsPreview } from "@/components/platforms/analytics-preview";
import type { SiteContent } from "@/types/content";

export function PlatformAdminSection({ content }: { content: SiteContent["platformPage"]["admin"] }) {
  return (
    <section className="section-space scroll-reveal scroll-mt-24 border-t border-line bg-canvas-soft" data-scroll-reveal id="admin-features">
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-12"><AnalyticsPreview image={content.dashboard} /></div>
      </div>
    </section>
  );
}
