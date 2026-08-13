"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ButtonLink } from "@/components/button-link";
import { siteContent } from "@/content/site-content";

function Brand() {
  return (
    <span
      className="inline-flex items-center gap-3 text-gold-bright"
      aria-hidden="true"
    >
      <BrandLogo className="h-9.5 w-10 md:h-10.5 md:w-11.25" />
      <span className="font-display text-sm font-bold tracking-[0.015em] uppercase whitespace-nowrap md:text-base">
        {siteContent.brand.name}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-100 min-h-19 border-b border-line bg-canvas md:min-h-24">
      <div className="container grid min-h-19 grid-cols-[1fr_auto] items-center gap-6 md:min-h-24 lg:grid-cols-[260px_1fr_auto] lg:gap-10">
        <Link
          className="inline-flex w-fit items-center"
          href="/"
          aria-label={`${siteContent.brand.name} home`}
        >
          <Brand />
        </Link>

        <nav
          className="hidden items-center justify-end gap-7 lg:flex xl:gap-12"
          aria-label="Primary navigation"
        >
          {siteContent.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-gold-bright ${item.href === pathname ? "text-gold-bright" : "text-muted"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="justify-self-end lg:hidden">
          <summary
            className="grid size-11.5 cursor-pointer list-none place-items-center rounded-xl border border-line-strong bg-surface text-ink marker:hidden"
            aria-label="Open navigation"
          >
            <span className="grid w-5 gap-1.5" aria-hidden="true">
              <span className="h-0.5 rounded-full bg-ink" />
              <span className="h-0.5 rounded-full bg-ink" />
            </span>
            <span className="sr-only">Menu</span>
          </summary>
          <nav
            className="absolute top-full right-0 left-0 grid gap-1 border-b border-line bg-canvas/98 px-6 pt-4.5 pb-6 shadow-panel"
            aria-label="Mobile navigation"
          >
            {siteContent.navigation.map((item) => (
              <Link
                className="border-b border-line px-1.5 py-3 text-ink-soft"
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href={siteContent.primaryCta.href} variant="primary">
              {siteContent.primaryCta.label}
            </ButtonLink>
          </nav>
        </details>
      </div>
    </header>
  );
}
