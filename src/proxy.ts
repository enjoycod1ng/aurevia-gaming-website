import { NextResponse, type NextRequest } from "next/server";
import { demoGameIds } from "@/content/demo-games";
import { contentSecurityPolicy, createNonce } from "@/lib/content-security-policy";
import { isLocale, languageCookie, localeHeader, localizedPath, preferredLocale } from "@/lib/i18n";

// The same paths next.config.ts marks no-store: they render per request and are
// never cached, so each response can carry its own nonce. The staff portal shares
// this origin, so these pages get a CSP without 'unsafe-inline' for scripts.
const noncePages = /^\/[^/]+\/(?:admin|demo(?:\/.*)?)$/;
const demoPage = /^\/[^/]+\/demo\/([^/]+)$/;

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const segment = url.pathname.split("/")[1];
  if (isLocale(segment)) {
    // Always overwrite: the 404 language comes from the URL, never the client.
    const headers = new Headers(request.headers);
    headers.set(localeHeader, segment);
    // A next.config.ts rewrite sends unknown games to the routed 404, which keeps
    // the site policy like every other 404.
    const game = url.pathname.match(demoPage)?.[1]?.toLowerCase();
    const unknownGame = game !== undefined && !demoGameIds.some((id) => id === game);
    if (unknownGame || !noncePages.test(url.pathname)) return NextResponse.next({ request: { headers } });
    const policy = contentSecurityPolicy(createNonce());
    // Next.js reads the nonce from the request's policy and adds it to its scripts.
    headers.set("Content-Security-Policy", policy);
    const response = NextResponse.next({ request: { headers } });
    // Proxy response headers are applied after next.config.ts headers and replace
    // its policy, so the browser receives only this one.
    response.headers.set("Content-Security-Policy", policy);
    return response;
  }
  if (url.pathname === "/" || url.pathname === "/admin") {
    url.pathname = localizedPath(url.pathname, preferredLocale(
      request.cookies.get(languageCookie)?.value,
      request.headers.get("accept-language") ?? "",
      request.headers.get("cf-ipcountry") ?? "",
    ));
    const response = NextResponse.redirect(url, 307);
    // Never let an edge cache share one visitor's language choice with others.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
    response.headers.set("Vary", "Cookie, Accept-Language, CF-IPCountry");
    return response;
  }
  // Existing indexed English pages retain a stable, permanent destination.
  url.pathname = localizedPath(url.pathname, "en");
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/", "/admin", "/services", "/games", "/casino-platforms", "/contact", "/privacy", "/docs", "/:locale(en|es|pt)/:path*"] };
