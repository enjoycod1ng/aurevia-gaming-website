import Script from "next/script";

// Cloudflare Web Analytics counts page views without cookies or device storage,
// so it needs no consent choice. HTML responses send no-transform, so Cloudflare
// cannot inject the beacon itself. The token is public and set at build time.
export function CloudflareWebAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim();
  if (!token || !/^[A-Za-z0-9]{16,64}$/.test(token)) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
