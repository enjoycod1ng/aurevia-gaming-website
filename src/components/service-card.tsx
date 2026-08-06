import { MediaFrame } from "@/components/media-frame";
import type { ServiceItem } from "@/types/content";

interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article
      className={`services-card services-card--${service.tone} scroll-reveal`}
      data-scroll-reveal
      id={service.id}
    >
      <span className="services-card__number">{service.number}</span>
      <div className="services-card__content">
        <h3>{service.title}</h3>
        <p className="services-card__description">{service.description}</p>
        <ul className="services-card__capabilities">
          {service.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </div>
      <MediaFrame
        image={service.image}
        sizes="(max-width: 660px) 100vw, (max-width: 900px) 34vw, 190px"
        className="services-card__media"
      />
    </article>
  );
}
