import Link from "next/link";

import { ServiceIcon } from "@/components/home/service-icon";
import type { SiteContent } from "@/types/content";

type HomeServicesContent = SiteContent["home"]["services"];

export function HomeServicesSection({
  content,
}: {
  content: HomeServicesContent;
}) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <div className="mb-12 max-w-262.5 md:mb-16">
          <p className="mb-8 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">
            {content.heading.label}
          </p>
          <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">{content.heading.title}</h2>
          <p className="mt-6 max-w-245 text-base leading-[1.65] text-muted">{content.heading.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.items.map((service, index) => (
            <article
              className={`scroll-reveal flex min-h-110 flex-col rounded-3xl border bg-surface p-6 transition hover:-translate-y-1 hover:border-gold md:min-h-125 md:p-8 ${index === 0 ? "border-gold/70" : "border-line-strong"}`}
              data-scroll-reveal
              key={service.number}
            >
              <span className="text-xs font-extrabold text-gold-bright">
                {service.number}
              </span>
              <span className="my-6 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-gold-bright to-[#9a6e10] text-white [&_svg]:size-6">
                <ServiceIcon name={service.icon} />
              </span>
              <h3 className="min-h-[2.35em] text-xl leading-[1.2]">{service.title}</h3>
              <p className="my-4 text-sm leading-7 text-muted">{service.description}</p>
              <Link className="mt-auto flex min-h-14.5 items-end gap-3 border-t border-line text-sm font-bold text-ink hover:text-gold-bright [&_svg]:size-4 [&_svg]:fill-none [&_svg]:stroke-current" href={service.action.href}>
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
