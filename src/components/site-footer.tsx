import Link from "next/link";

import { siteContent } from "@/content/site-content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link href="/" aria-label={`${siteContent.brand.name} home`}>
            {siteContent.brand.name}
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
          <a href={siteContent.contact.telegramUrl} target="_blank" rel="noreferrer">
            {siteContent.footer.telegramLabel} {siteContent.contact.telegramHandle}
          </a>
          <p>© {new Date().getFullYear()} {siteContent.brand.name}</p>
        </div>
      </div>
    </footer>
  );
}
