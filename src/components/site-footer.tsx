import Link from "next/link";

import { CookiePreferencesButton } from "@/components/analytics/cookie-preferences-button";
import { BrandLogo } from "@/components/brand-logo";
import { siteContent } from "@/content/site-content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link
            className="footer-brand-lockup"
            href="/"
            aria-label={`${siteContent.brand.name} home`}
          >
            <BrandLogo className="brand__symbol" aria-hidden="true" />
            <span>{siteContent.brand.name}</span>
          </Link>
          <p>{siteContent.footer.description}</p>
        </div>

        <nav className="site-footer__links" aria-label="Footer navigation">
          {siteContent.navigation.slice(1).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-footer__contact">
          <a
            href={siteContent.contact.telegramUrl}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="telegram_click"
          >
            {siteContent.footer.telegramLabel}{" "}
            {siteContent.contact.telegramHandle}
          </a>
          <p>
            © {new Date().getFullYear()} {siteContent.brand.name}
          </p>
          <div className="site-footer__legal-links">
            <Link href="/privacy">Privacy</Link>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
