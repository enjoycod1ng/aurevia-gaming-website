"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

// Prerendered pages carry the build year; after hydration the visitor's clock
// replaces it, so the footer stays current between releases.
export function CurrentYear({ buildYear }: { buildYear: number }) {
  return useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );
}
