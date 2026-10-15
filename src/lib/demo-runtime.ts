// Play'n GO runtime code should not share an origin with the staff portal:
// same-origin frame scripts can call /api/portal/admin with a signed-in admin's
// cookies. Set NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN (for example
// https://play.aureviagaming.com) once the runtime is served from its own
// subdomain; until then the runtime stays on the site origin.
export function separateDemoRuntimeOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN?.trim();
  if (!configured) return null;
  const url = new URL(configured);
  if (url.protocol !== "https:" || url.origin !== configured.replace(/\/$/, ""))
    throw new Error("NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN must be a bare https origin");
  return url.origin;
}

export function demoRuntimeOrigin(siteOrigin: string): string {
  return separateDemoRuntimeOrigin() ?? siteOrigin;
}

export function isDemoRuntimeUrl(
  launchUrl: string,
  game: string,
  siteOrigin: string,
): URL | null {
  const url = new URL(launchUrl, siteOrigin);
  return url.origin === demoRuntimeOrigin(siteOrigin) &&
    url.pathname.startsWith(`/playngo-sandbox/runtime/${game}/`)
    ? url
    : null;
}

// No top-level navigation, downloads or plugins. On a separate runtime origin
// allow-same-origin only grants the runtime its own origin.
export const DEMO_FRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox";
