import type { NextConfig } from "next";
import { demoGameIds } from "./src/content/demo-games";
import { contentSecurityPolicy } from "./src/lib/content-security-policy";

const isStaging = process.env.APP_ENV === "staging";

const securityHeaders = [
  // src/proxy.ts replaces this with a nonce-based policy on admin and demo pages.
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Browsers honor this only over HTTPS. No includeSubDomains until every
  // subdomain is confirmed to serve HTTPS (ops/CLOUDFLARE-PRODUCTION.md).
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const stagingHeaders = isStaging
  ? [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ]
  : [];

const staticDocumentPaths = [
  "/:locale(en|es|pt)",
  "/:locale(en|es|pt)/services",
  "/:locale(en|es|pt)/games",
  "/:locale(en|es|pt)/casino-platforms",
  "/:locale(en|es|pt)/privacy",
  "/:locale(en|es|pt)/docs",
];

const staticDocumentHeaders = staticDocumentPaths.map((source) => ({
  source,
  headers: [
    {
      // Revalidated on every request, so no cache can keep serving a page whose
      // scripts a later release removed. Cloudflare is not purged on deploy.
      key: "Cache-Control",
      value: "public, max-age=0, must-revalidate, no-transform",
    },
  ],
}));

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  productionBrowserSourceMaps: false,
  // Set in GitHub Actions. A tab opened before a deploy then reloads on its next
  // navigation instead of requesting scripts the new release no longer has.
  deploymentId: process.env.GITHUB_SHA?.slice(0, 12),
  // notFound() thrown during a render only reaches the client; routed 404s render
  // app/global-not-found.tsx on the server (the root layout is [locale]).
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/webp"],
    qualities: [70, 80],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
    localPatterns: [
      {
        pathname: "/media/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...stagingHeaders],
      },
      ...staticDocumentHeaders,
      {
        source: "/:locale(en|es|pt)/admin",
        headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|es|pt)/demo/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:locale(en|es|pt)/contact",
        headers: [
          {
            key: "Cache-Control",
            value:
              "private, no-cache, no-store, max-age=0, must-revalidate, no-transform",
          },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value:
              "public, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  async rewrites() {
    return {
      // Unknown games get the routed 404 (app/global-not-found.tsx) before the
      // per-request demo page renders, where notFound() would send an empty error
      // shell. This must not be a src/proxy.ts rewrite: behind Nginx the request
      // carries X-Forwarded-Proto, Next.js then treats an absolute proxy rewrite
      // as external and fetches it over HTTPS from its own HTTP port (a 500).
      // Matching ignores case; the demo page redirects other spellings of a game.
      beforeFiles: [
        {
          source: `/:locale(en|es|pt)/demo/:game((?!(?:${demoGameIds.join("|")})$)[^/]+)`,
          destination: "/:locale/_unmatched/demo/:game",
        },
      ],
      // Runs after public files, so real assets are never shadowed. Any other path
      // outside a locale (/about, /fr, /missing-icon.png) would otherwise reach
      // [locale] with an invalid locale and throw in the root layout. "_" folders are
      // private in the App Router, so the destination never matches a route (not even
      // /demo/<game>) and gets the routed English 404 from app/global-not-found.tsx.
      afterFiles: [{ source: "/:first((?!(?:en|es|pt|api|_next)(?:/|$))[^/]+)/:rest*", destination: "/en/_unmatched/:first/:rest*" }],
    };
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aureviagaming.com" }],
        destination: "https://aureviagaming.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
