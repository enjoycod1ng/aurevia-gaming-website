"use client";

import { openCookiePreferences } from "./analytics-consent";

export function CookiePreferencesButton() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

  if (!gaId || !/^G-[A-Z0-9]+$/.test(gaId)) {
    return null;
  }

  return (
    <button
      className="site-footer__preferences"
      type="button"
      onClick={openCookiePreferences}
    >
      Cookie preferences
    </button>
  );
}
