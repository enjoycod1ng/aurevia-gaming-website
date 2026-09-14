import { NextResponse, type NextRequest } from "next/server";
import { languageCookie, localizedPath, preferredLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
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

export const config = { matcher: ["/", "/admin", "/services", "/games", "/casino-platforms", "/contact", "/privacy", "/docs"] };
