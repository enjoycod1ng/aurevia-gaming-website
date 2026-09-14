"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ButtonLink } from "@/components/button-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { SiteContent } from "@/types/content";
import type { UiContent } from "@/content/ui-content";

type HeaderContent = Pick<SiteContent, "brand" | "navigation" | "primaryCta">;
export function SiteHeader({ content, ui, locale }: { content: HeaderContent; ui: UiContent; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false); };
    if (open) { document.addEventListener("keydown", onKey); document.addEventListener("pointerdown", onPointer); }
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  return (
    <header ref={header} className="sticky top-0 z-100 border-b border-line bg-canvas/95 backdrop-blur-md">
      <div className="container flex min-h-20 flex-wrap items-center justify-between gap-x-3 gap-y-3 py-3">
        <Link href={localizedPath("/", locale)} aria-label={`${content.brand.name} · ${ui.home}`} className="inline-flex min-h-11 items-center gap-2 text-gold-bright" onClick={() => setOpen(false)}>
          <BrandLogo className="size-8 sm:size-9" aria-hidden="true" /><span className="font-display text-xs font-bold uppercase sm:text-base">{content.brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-5 xl:flex" aria-label={ui.primaryNavigation}>
          {content.navigation.map(item => <Link key={item.href} href={item.href} aria-current={item.href === pathname ? "page" : undefined} className={`nav-link ${item.href === pathname ? "text-gold-bright" : "text-ink-soft"}`}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 xl:flex"><ThemeToggle labels={ui} /><LanguageSwitcher locale={locale} label={ui.language} /></div>
        <button ref={toggle} type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold xl:hidden" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"} /></svg>{open ? ui.closeMenu : ui.menu}
        </button>
        <div id="mobile-navigation" hidden={!open} className="max-h-[calc(100svh-6rem)] w-full overflow-y-auto border-t border-line pt-3 xl:hidden">
          <nav className="grid gap-1" aria-label={ui.mobileNavigation}>
            {content.navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={item.href === pathname ? "page" : undefined} className={`nav-link rounded-lg px-3 ${item.href === pathname ? "bg-surface text-gold-bright" : "text-ink-soft"}`}>{item.label}</Link>)}
          </nav>
          <div className="my-4 flex flex-wrap gap-3"><ThemeToggle labels={ui} /><LanguageSwitcher locale={locale} label={ui.language} /></div>
          <div onClick={() => setOpen(false)}><ButtonLink href={content.primaryCta.href} className="mb-2 w-full">{content.primaryCta.label}</ButtonLink></div>
        </div>
      </div>
    </header>
  );
}
