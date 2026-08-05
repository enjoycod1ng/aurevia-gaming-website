import { ServiceIcon } from "@/components/home/service-icon";
import type { ServiceLayer } from "@/types/content";

interface ServicesLayerPanelProps {
  ariaLabel: string;
  layers: readonly ServiceLayer[];
}

export function ServicesLayerPanel({ ariaLabel, layers }: ServicesLayerPanelProps) {
  return (
    <aside className="services-layer-panel" aria-label={ariaLabel}>
      <div className="services-layer-panel__grid">
        {layers.map((layer) => (
          <article
            className={`services-layer services-layer--${layer.tone}`}
            key={layer.title}
          >
            <span className="services-layer__icon">
              <ServiceIcon name={layer.icon} />
            </span>
            <h3>{layer.title}</h3>
            <p>{layer.detail}</p>
            <span className="services-layer__track" aria-hidden="true">
              <span style={{ width: `${layer.progress}%` }} />
            </span>
          </article>
        ))}
      </div>
    </aside>
  );
}
