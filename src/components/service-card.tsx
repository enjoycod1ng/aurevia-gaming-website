import Link from "next/link";

import { MediaFrame } from "@/components/media-frame";
import type { ServiceItem } from "@/types/content";

interface ServiceCardProps {
  service: ServiceItem;
  compact?: boolean;
}

type ServiceIconName = "spark" | "devices" | "diamond" | "controls";

const serviceIcons: Record<string, ServiceIconName> = {
  "slot-betting-games": "spark",
  "web-mobile": "devices",
  "casino-websites": "diamond",
  "admin-platforms": "controls"
};

function ServiceCardIcon({ name }: { name: ServiceIconName }) {
  const sharedProps = {
    "aria-hidden": true,
    className: "service-card__icon",
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  } as const;

  if (name === "devices") {
    return (
      <svg {...sharedProps}>
        <rect x="3" y="5" width="13" height="10" rx="1.5" />
        <path d="M7 19h5M9.5 15v4" />
        <rect x="15" y="9" width="6" height="10" rx="1.5" />
      </svg>
    );
  }

  if (name === "diamond") {
    return (
      <svg {...sharedProps}>
        <path d="m12 3 8 9-8 9-8-9 8-9Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "controls") {
    return (
      <svg {...sharedProps}>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
        <circle cx="14" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path
        d="M12 2.5c.8 4.6 3.2 7 7.5 7.8-4.3.8-6.7 3.2-7.5 7.7-.8-4.5-3.2-6.9-7.5-7.7C8.8 9.5 11.2 7.1 12 2.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  if (compact) {
    return (
      <article className="service-card">
        <div className="service-card__number">{service.number}</div>
        <div className="service-card__icon-tile">
          <ServiceCardIcon name={serviceIcons[service.id] ?? "spark"} />
        </div>
        <h3>{service.title}</h3>
        <p>{service.summary}</p>
        <Link className="text-link" href={`/services#${service.id}`}>
          Learn more <span aria-hidden="true">&rarr;</span>
        </Link>
      </article>
    );
  }

  return (
    <article className="service-detail" id={service.id}>
      <div className="service-detail__content">
        <p className="service-detail__number">{service.number}</p>
        <h2>{service.title}</h2>
        <p className="service-detail__summary">{service.summary}</p>
        <p>{service.description}</p>
        <ul className="check-list">
          {service.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </div>
      <MediaFrame
        image={service.image}
        sizes="(max-width: 900px) 100vw, 50vw"
        className="service-detail__media"
      />
    </article>
  );
}
