import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ServicesProcessContent = SiteContent["servicesPage"]["process"];

export function ServicesProcessSection({
  content,
}: {
  content: ServicesProcessContent;
}) {
  return (
    <section className="services-process section--content-visibility">
      <div className="container">
        <SectionHeading {...content.heading} />
        <ol className="services-process__steps">
          {content.steps.map((step, index) => (
            <li
              className={index === 0 ? "is-featured" : undefined}
              key={step.number}
            >
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
