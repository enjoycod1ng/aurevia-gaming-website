import { MediaFrame } from "@/components/media-frame";
import type { ServiceItem } from "@/types/content";

interface ServiceCardProps {
  service: ServiceItem;
}

const toneClasses = {
  gold: "text-gold-bright before:bg-gold-bright",
  blue: "text-[#2bb7f6] before:bg-[#2bb7f6]",
  violet: "text-[#ad5cff] before:bg-[#ad5cff]",
  green: "text-success before:bg-success",
} as const;

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article
      className="scroll-reveal grid min-h-142.5 scroll-mt-28 grid-cols-1 gap-6 rounded-3xl border border-line-strong bg-surface p-6 sm:grid-cols-[minmax(0,1fr)_190px] sm:p-8"
      data-scroll-reveal
      id={service.id}
    >
      <span className={`col-span-full text-xs font-extrabold ${toneClasses[service.tone].split(" ")[0]}`}>{service.number}</span>
      <div className="min-w-0">
        <h3 className="max-w-80 text-2xl leading-[1.2] uppercase">{service.title}</h3>
        <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>
        <ul className="mt-6 grid list-none gap-4 p-0">
          {service.capabilities.map((capability) => (
            <li
              className={`relative pl-7 text-xs font-medium leading-5 text-ink-soft before:absolute before:top-0 before:left-0 before:grid before:size-4.5 before:place-items-center before:rounded-full before:text-[#07100b] before:content-['✓'] ${toneClasses[service.tone]}`}
              key={capability}
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
      <MediaFrame
        image={service.image}
        sizes="(max-width: 660px) 100vw, (max-width: 900px) 34vw, 190px"
        className="h-full min-w-0 [&>div]:flex [&>div]:h-full [&>div]:min-h-65 [&>div]:items-center [&>div]:rounded-2xl [&>div]:bg-[#090d13] [&>div]:p-3.5 [&_img]:max-h-full [&_img]:object-contain"
      />
    </article>
  );
}
