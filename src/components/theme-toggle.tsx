"use client";

import { useSyncExternalStore } from "react";
import { themeStorageKey } from "@/lib/theme";

const eventName = "aurevia:theme-change";
function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== themeStorageKey && event.key !== null) return;
    const theme = event.newValue === "light" || event.newValue === "dark" ? event.newValue : "system";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
    onChange();
  };
  window.addEventListener(eventName, onChange);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(eventName, onChange); window.removeEventListener("storage", onStorage); };
}
export function ThemeToggle({ labels }: { labels: { theme: string; system: string; light: string; dark: string } }) {
  const theme = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme ?? "system", () => "system");
  const current = theme === "light" || theme === "dark" ? theme : "system";
  const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
  const description = `${labels.theme}: ${labels[current]} → ${labels[next]}`;
  return (
    <button type="button" className="preference-control min-h-11 cursor-pointer text-sm" aria-label={description} title={description} onClick={() => {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next === "system" ? "light dark" : next;
      try { window.localStorage.setItem(themeStorageKey, next); } catch { /* Keep this session's choice. */ }
      window.dispatchEvent(new Event(eventName));
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
      <span>{labels[current]}</span>
    </button>
  );
}
