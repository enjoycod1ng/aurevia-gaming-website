"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { languageCookie, localeNames, locales, localizedPath, type Locale } from "@/lib/i18n";

function saveLanguage(locale: Locale) {
  document.cookie = `${languageCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

export function LanguageLinks({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  return <nav aria-label={label} className="mt-3 flex flex-wrap gap-4">{locales.map(language => <Link key={language} href={localizedPath(pathname, language)} hrefLang={language} lang={language} aria-current={locale === language ? "true" : undefined} onClick={() => saveLanguage(language)} className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline aria-[current=true]:text-gold-bright">{localeNames[language]}</Link>)}</nav>;
}

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  return (
    <label className="preference-control">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></svg>
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={locale} onChange={(event) => {
        const next = event.target.value as Locale;
        saveLanguage(next);
        window.location.assign(localizedPath(pathname, next) + window.location.search + window.location.hash);
      }}>
        {locales.map((value) => <option key={value} value={value} lang={value}>{localeNames[value]}</option>)}
      </select>
    </label>
  );
}
