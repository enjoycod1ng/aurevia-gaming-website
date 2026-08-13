import { ServiceIcon } from "@/components/home/service-icon";
import type { ServiceLayer } from "@/types/content";

interface ServicesLayerPanelProps {
  ariaLabel: string;
  layers: readonly ServiceLayer[];
}

const toneClasses = {
  gold: "bg-gold-bright",
  blue: "bg-[#2bb7f6]",
  violet: "bg-[#ad5cff]",
  green: "bg-success",
} as const;

export function ServicesLayerPanel({
  ariaLabel,
  layers,
}: ServicesLayerPanelProps) {
  return (
    <aside className="min-h-125 rounded-[26px] border border-line-strong bg-surface/95 p-4.5 shadow-panel sm:p-6 lg:p-7.5" aria-label={ariaLabel}>
      <div className="grid h-full grid-cols-2 gap-3 sm:gap-6">
        {layers.map((layer) => (
          <article className="flex min-h-45 flex-col rounded-[18px] border border-line bg-[#10151e] px-4 py-5 sm:min-h-51 sm:px-5.5 sm:py-6" key={layer.title}>
            <span className={`grid size-11 place-items-center rounded-full text-white [&_svg]:size-6 ${toneClasses[layer.tone]}`}>
              <ServiceIcon name={layer.icon} />
            </span>
            <h3 className="mt-5.5 text-sm leading-[1.2] uppercase sm:mt-6.5 sm:text-base">{layer.title}</h3>
            <p className="mt-2.5 text-xs text-muted">{layer.detail}</p>
            <span className="mt-auto block h-1.5 overflow-hidden rounded-full bg-[#242c38]" aria-hidden="true">
              <span className={`block h-full rounded-[inherit] ${toneClasses[layer.tone]}`} style={{ width: `${layer.progress}%` }} />
            </span>
          </article>
        ))}
      </div>
    </aside>
  );
}
