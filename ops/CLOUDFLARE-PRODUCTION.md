# Aurevia production setup: Cloudflare Free, Turnstile, and GA4

Verified against the official documentation on August 12, 2026. Re-check the
linked pages before changing a live account because plan limits and dashboard
labels can change.

## What is already live

The public audit and dashboard setup on August 12, 2026 confirmed:

- `aureviagaming.com` uses Cloudflare nameservers (`ian.ns.cloudflare.com` and
  `sara.ns.cloudflare.com`) and proxied Cloudflare addresses.
- HTTP already redirects to HTTPS and HTTP/3 is advertised.
- The health endpoint returns `200` with `Cache-Control: no-store`.
- Static assets are cached at Cloudflare through the explicit cache rule below.
- `https://www.aureviagaming.com` redirects to the canonical apex domain and
  preserves the path and query string.
- DNSSEC is signed by Cloudflare and the DS record is published at Hostinger.
- Nginx, `pm2-deploy`, unattended security updates, fail2ban's `sshd` jail, and
  PM2 log rotation are enabled. A reboot test confirmed automatic recovery on
  kernel `6.8.0-137-generic`.
- SSH password authentication and direct remote root login are disabled; the
  existing deploy key and Hostinger web console remain the recovery paths.

The application contains fallbacks for the cache headers and `www` redirect.
The live origin currently runs Nginx and PM2; `ops/Caddyfile` is a reference for
a future Caddy migration, not the active production proxy.

## 1. Production environment

Create `/etc/aurevia-gaming/production.env` on the VPS with mode `0600`:

```dotenv
SITE_URL=https://aureviagaming.com

NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public site key>
TURNSTILE_SECRET_KEY=<server-only secret key>
TURNSTILE_ALLOWED_HOSTNAMES=aureviagaming.com,www.aureviagaming.com

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

TELEGRAM_BOT_TOKEN=<server-only bot token>
TELEGRAM_CHAT_ID=<destination chat id>
```

Use either the Telegram variables or the webhook variables documented in
`.env.example`. Never put `TURNSTILE_SECRET_KEY`, bot tokens, chat IDs, or
webhook bearer tokens in a `NEXT_PUBLIC_` variable or in Git.

`NEXT_PUBLIC_*` values are embedded during `npm run build`. Build the release
with the production site key and GA measurement ID present; changing either
requires a new build and deployment.

For local development only, Cloudflare publishes these deterministic keys:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_ALLOWED_HOSTNAMES=example.com,localhost,127.0.0.1
```

Do not deploy test keys to production. Production and test keys reject each
other's tokens.

## 2. Turnstile widget

In **Cloudflare dashboard -> Turnstile -> Add widget**:

- Name: `Aurevia contact form`
- Mode: `Managed`
- Hostname: `aureviagaming.com` (Cloudflare authorizes its subdomains too)
- Pre-clearance: off (not needed for this form)

Copy the public site key and secret into the environment above. The server
validates every real submission through Siteverify, including the expected
hostname and the `request_quote` action. Tokens are limited to 2,048
characters, expire after five minutes, and are single-use.

Official references:

- [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)
- [Hostname management](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
- [Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)

## 3. Canonical hostname redirect

The Free plan currently provides 10 Single Redirect rules. Create the first
rule at **Rules -> Redirect Rules**:

```text
Name: Canonical www to apex
Request URL: https://www.aureviagaming.com/*
Target URL:  https://aureviagaming.com/${1}
Status:      301
Preserve query string: On
```

The Caddyfile and Next.js redirect are defense-in-depth; the Cloudflare rule is
the fastest path and fixes the duplicate live hostname before a request reaches
the VPS.

Reference: [Cloudflare WWW-to-root example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/).

## 4. SSL, transport, and DNS

Set the following:

- **SSL/TLS -> Overview -> Encryption mode:** `Full (strict)`
- **SSL/TLS -> Edge Certificates -> Always Use HTTPS:** on
- **Minimum TLS version:** `TLS 1.2`
- **TLS 1.3:** on
- **Network -> HTTP/3:** on
- Keep Cloudflare's default compression. On Free, Cloudflare currently uses
  Zstandard when supported and falls back to Brotli or Gzip; there is no legacy
  Brotli toggle to enable.
- Keep Rocket Loader off for this Next.js application.
- Do not enable HSTS preload. The origin currently sends one year of HSTS with
  subdomains; verify every subdomain before changing that policy.

Under **DNS -> Settings**, enable DNSSEC. If the registrar is not Cloudflare,
copy the DS values Cloudflare generates into the registrar and wait for the
dashboard to show DNSSEC as active.

Keep the apex `A` record and `www` record orange-cloud proxied. Keep MX, SPF,
DKIM, DMARC, mail hosts, verification records, and SSH hosts DNS-only. The
public MX records currently point to Hostinger and must not be proxied.

References:

- [Full (strict) TLS](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [TLS 1.3](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/)
- [DNSSEC](https://developers.cloudflare.com/dns/dnssec/)

## 5. CDN/cache rule

Cloudflare already caches common static extensions and respects origin cache
headers on Free. Create one explicit Cache Rule so the intended paths remain
obvious and the query-based Next.js image optimizer is eligible:

```text
Name: Cache immutable Next.js and media assets

starts_with(http.request.uri.path, "/_next/static/") or
http.request.uri.path eq "/_next/image" or
starts_with(http.request.uri.path, "/media/")
```

Settings:

- Cache eligibility: `Eligible for cache`
- Edge TTL: `Respect origin`
- Browser TTL: `Respect origin`
- Cache key: default (retain the full query string)
- Do not use Cache Everything for the zone.

Never cache `/api/*`, contact responses, arbitrary HTML, or JSON. The app sends
seven-day browser caching plus a 30-day Cloudflare-only TTL for `/media/*`.
Hash-named `/_next/static/*` assets remain immutable. Current Free accounts
have 10 Cache Rules.

References:

- [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Origin Cache Control](https://developers.cloudflare.com/cache/concepts/cache-control/)
- [Cache Rules availability](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Next.js CDN caching](https://nextjs.org/docs/app/guides/cdn-caching)

R2 is intentionally not part of the first deployment. The current optimized
media is small and already receives CDN delivery from the VPS. Add R2 only when
media needs an independent upload lifecycle or repository size becomes a real
problem.

## 6. WAF, bots, and rate limiting

The **Cloudflare managed ruleset** is always active on this Free zone. Keep
**Browser Integrity Check** and **Bot Fight Mode** enabled, and monitor Security
Events because Free Bot Fight Mode cannot be bypassed for individual paths.

The Free plan currently includes one rate-limiting rule. Use it for the contact
endpoint:

```text
Name: Rate limit contact form submissions
Expression:
http.request.uri.path eq "/api/contact"

Characteristic: IP
Requests:       5
Period:         10 seconds
Action:         Block
Duration:       10 seconds
Response code:  429
```

Free currently allows `Path` and `Verified Bot` in the matching expression, so
the method check remains in the application rather than in the edge rule.

The application also has a bounded in-process limit. The Cloudflare rule is the
authoritative distributed limit and stops bursts before they reach the VPS.

References:

- [WAF plan availability](https://developers.cloudflare.com/waf/)
- [Rate-limit parameters](https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/)
- [Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)

## 7. GA4 with basic consent mode

In Google Analytics:

1. Create a GA4 property and one Web data stream for
   `https://aureviagaming.com`.
2. Copy its `G-...` measurement ID into `NEXT_PUBLIC_GA_ID` before building.
3. Keep Enhanced Measurement pageviews enabled. Next.js client-side navigation
   changes are measured automatically.
4. Under the Web stream's data-redaction settings, enable email redaction and
   redact the `project` and `status` URL query parameters. The app removes these
   parameters after hydration as a second layer, but property-level redaction
   also protects against unexpected links and future regressions.
5. Use the shortest event-data retention that meets the business need (two
   months is the privacy-minimizing Standard option). Leave Google Signals and
   advertising personalization off unless the business has a documented need
   and matching consent language.
6. After the first successful form test, mark `request_quote_submit` as a key
   event. Other implemented events are `request_quote_click`,
   `demo_request_click`, `telegram_click`, `whatsapp_click`, and `phone_click`.

The app uses Google's basic consent pattern: the Google tag is not requested
and no analytics data is sent until the visitor accepts analytics. The footer
reopens preferences; revocation disables GA and removes accessible `_ga*`
cookies. No contact-form values are ever attached to analytics events.

References:

- [GA4 setup](https://support.google.com/analytics/answer/14183469?hl=en)
- [Basic vs. advanced consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Next.js Google Analytics integration](https://nextjs.org/docs/app/guides/third-party-libraries)
- [Avoid PII in Analytics](https://support.google.com/analytics/answer/6366371?hl=en)

Have counsel or the business owner review `/privacy` before launch, especially
the controller contact details and the exact inquiry-retention policy.

## 8. Protect the VPS origin

The live Nginx origin currently accepts HTTP/HTTPS publicly, while Cloudflare
is the advertised path. The checked-in Caddyfile is a future migration reference
that restores client IPs only from Cloudflare's currently published proxy
ranges. Before deploying it, compare the list with:

- `https://www.cloudflare.com/ips-v4/`
- `https://www.cloudflare.com/ips-v6/`

After confirming SSH access through a separate session, allow TCP 80/443 from
those Cloudflare IPv4/IPv6 ranges and deny public 80/443 from other sources.
Keep SSH allowed only from trusted administrator IPs where practical. Do not
open port 3000; PM2 binds Next.js to `127.0.0.1:3000`.

Cloudflare recommends blocking non-Cloudflare traffic at the origin so an
attacker cannot bypass the WAF and rate limit. Cloudflare Tunnel is the stronger
free alternative when you are ready to replace inbound web ports with an
outbound-only tunnel.

Reference: [Protect your origin](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/).

## 9. Deploy and verify

Only when performing the future Caddy migration:

```bash
caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Build and deploy through the repository release workflow, then test:

```bash
curl -I http://aureviagaming.com
curl -I https://www.aureviagaming.com/contact?project=test
curl -I https://aureviagaming.com/media/hero/hero-platform.webp
curl -I https://aureviagaming.com/media/hero/hero-platform.webp
curl -I https://aureviagaming.com/api/health
```

Expected results:

- HTTP and `www` make one canonical redirect to the apex while retaining path
  and query.
- Repeated media requests eventually show `CF-Cache-Status: HIT` and the new
  origin cache policy.
- API responses show `Cache-Control: no-store`.
- The CSP allows `challenges.cloudflare.com`, `googletagmanager.com`, and
  `*.google-analytics.com`, but no unrelated third-party origins.

Browser verification:

1. With no saved choice, GA scripts and `_ga` cookies are absent.
2. Reject analytics; reload; GA remains absent.
3. Accept analytics; GA4 Realtime shows a page view.
4. Reopen Cookie preferences, turn analytics off, and verify GA requests stop.
5. Submit valid, missing, invalid, expired, and reused Turnstile tokens.
6. Confirm only a valid, single-use token delivers an inquiry.
7. Confirm no name, contact value, message, or query string containing personal
   data appears in GA4 DebugView.

After verification, inspect Cloudflare Security Events, Turnstile Analytics,
GA4 Realtime, Nginx logs, `pm2 logs aurevia-gaming`, and
`journalctl -u pm2-deploy`.
