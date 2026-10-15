import { NextResponse, type NextRequest } from "next/server";
import { isLocale, languageCookie, localeHeader, localizedPath, preferredLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const segment = url.pathname.split("/")[1];
  if (isLocale(segment)) {
    // Always overwrite: the 404 language comes from the URL, never the client.
    const headers = new Headers(request.headers);
    headers.set(localeHeader, segment);
    return NextResponse.next({ request: { headers } });
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
