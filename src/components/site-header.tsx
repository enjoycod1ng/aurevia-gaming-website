"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ButtonLink } from "@/components/button-link";
import { siteContent } from "@/content/site-content";

function Brand() {
  return (
    <span className="brand__lockup" aria-hidden="true">
      <BrandLogo className="brand__symbol" />
      <span className="brand__name">{siteContent.brand.name}</span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          className="brand"
          href="/"
          aria-label={`${siteContent.brand.name} home`}
        >
          <Brand />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteContent.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === pathname ? "is-current" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__cta">
          <ButtonLink href={siteContent.primaryCta.href} variant="primary">
            {siteContent.primaryCta.label}
          </ButtonLink>
        </div>

        <details className="mobile-nav">
          <summary aria-label="Open navigation">
            <span className="mobile-nav__icon" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="sr-only">Menu</span>
          </summary>
          <nav className="mobile-nav__panel" aria-label="Mobile navigation">
            {siteContent.navigation.map((item) => (
              <Link key={item.href} href={item.href}>
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
