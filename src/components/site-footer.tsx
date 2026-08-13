import Link from "next/link";

import { CookiePreferencesButton } from "@/components/analytics/cookie-preferences-button";
import { BrandLogo } from "@/components/brand-logo";
import { siteContent } from "@/content/site-content";

export function SiteFooter() {
  return (
    <footer className="bg-canvas">
      <div className="container grid min-h-65 grid-cols-1 gap-7.5 py-11 md:min-h-52.5 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-15">
        <div>
          <Link
            className="inline-flex items-center gap-2.5 font-display text-base font-bold leading-none text-gold-bright uppercase"
            href="/"
            aria-label={`${siteContent.brand.name} home`}
          >
            <BrandLogo className="h-10.5 w-11.25" aria-hidden="true" />
            <span>{siteContent.brand.name}</span>
          </Link>
          <p className="mt-4 max-w-117.5 text-xs text-muted">{siteContent.footer.description}</p>
        </div>

        <nav className="flex flex-wrap gap-4.5 md:order-3 md:col-span-2 lg:order-none lg:col-span-1" aria-label="Footer navigation">
          {siteContent.navigation.slice(1).map((item) => (
            <Link className="text-xs font-medium text-muted transition-colors hover:text-ink" key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-left lg:justify-self-end lg:text-right">
          <a
            href={siteContent.contact.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-gold-bright"
            data-analytics-event="telegram_click"
          >
            {siteContent.footer.telegramLabel}{" "}
            {siteContent.contact.telegramHandle}
          </a>
          <p className="mt-4 text-xs text-muted">
            © {new Date().getFullYear()} {siteContent.brand.name}
          </p>
          <div className="mt-2.5 flex gap-3 lg:justify-end [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-xs [&_button]:font-medium [&_button]:text-muted [&_button:hover]:text-ink">
            <Link className="text-xs font-medium text-muted hover:text-ink" href="/privacy">Privacy</Link>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
