import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ServicesPrinciplesContent = SiteContent["servicesPage"]["principles"];

export function ServicesPrinciplesSection({
  content,
}: {
  content: ServicesPrinciplesContent;
}) {
  return (
    <section className="services-principles section--content-visibility">
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="services-principles__grid">
          {content.items.map((item) => (
            <article
              className={`services-principle services-principle--${item.tone}`}
              key={item.title}
            >
              <span className="services-principle__icon">
                <ServiceIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
