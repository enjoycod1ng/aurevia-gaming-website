import Link from "next/link";

import { ServiceIcon } from "@/components/home/service-icon";
import type { SiteContent } from "@/types/content";

type HomeServicesContent = SiteContent["home"]["services"];

export function HomeServicesSection({ content }: { content: HomeServicesContent }) {
  return (
    <section className="home-section home-services">
      <div className="container">
        <div className="home-section-heading">
          <p className="home-kicker">{content.heading.label}</p>
          <h2>{content.heading.title}</h2>
          <p>{content.heading.description}</p>
        </div>
        <div className="home-service-grid">
          {content.items.map((service, index) => (
            <article
              className={index === 0 ? "home-service-card is-featured" : "home-service-card"}
              key={service.number}
            >
              <span className="home-service-card__number">{service.number}</span>
              <span className="home-service-card__icon">
                <ServiceIcon name={service.icon} />
              </span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <Link href={service.action.href}>
                {service.action.label}
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
