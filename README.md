# Aurevia Gaming — Next.js website

A production-oriented, configuration-driven marketing website for `aureviagaming.com`.

The project uses the Next.js App Router, React Server Components, TypeScript, local WebP media, responsive image optimization, server-rendered metadata, a Turnstile-protected contact form, consent-gated GA4, and standalone VPS deployment behind Cloudflare. Production currently uses Nginx and PM2; the Caddy and systemd files under `ops/` document the planned standalone migration.

## Stack

- Next.js 16.3.0
- React 19.2.8
- TypeScript
- Tailwind CSS 4 with CSS-first theme tokens and a minimal global base layer
- Sharp for self-hosted image optimization and the included WebP conversion script
- Node.js 24 LTS on the VPS
- Nginx and PM2 on the live VPS; Caddy and a standalone systemd unit are available for a future migration
- Cloudflare Free for DNS, CDN, WAF, DDoS protection, rate limiting and Turnstile
- Google Analytics 4 behind an explicit analytics-consent control
- systemd for process supervision

## Project structure

```text
src/
  app/                    App Router pages, metadata routes and API endpoints
  components/             Reusable server-rendered UI components
  content/site-content.ts All editable website content and media references
  lib/                    Metadata and JSON-LD helpers
  types/content.ts        Strongly typed content schema
public/media/              WebP game and admin screenshots
scripts/                   Image optimization and release packaging
ops/                       Caddy, systemd and VPS deployment files
```

Component styling uses colocated Tailwind utilities. `src/app/globals.css`
contains only the Tailwind import, shared design tokens, base element defaults,
and the global scroll-reveal behavior. Tailwind 4 discovers source classes
automatically, so the project does not require a `tailwind.config.js` file.

## Local development

Node.js 24 is recommended so local and production runtimes match.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

After the first install, commit the generated `package-lock.json`. Production and CI can then use deterministic `npm ci` installs.

## Configurable content

Edit `src/content/site-content.ts` to change:

- Brand and contact information
- Header and footer navigation
- Page titles, descriptions, CTAs and SEO keywords
- Services and capability lists
- Game catalog, filters, artwork themes, optional images and action URLs
- Casino platform modules, dashboard data, RTP profiles, integrations and security controls
- Contact-page copy, quote fields, project types, proof points, process steps and common questions
- Process steps and FAQs
- Screenshot paths, alt text and intrinsic dimensions

The file is checked against `SiteContent` with TypeScript's `satisfies` operator, so missing or malformed fields fail during type-checking.

Operational secrets do **not** belong in the content file. They are read from environment variables on the VPS.

## Replacing Figma SVG/image placeholders with WebP screenshots

The bundled images are small sample WebP files, not final Figma exports.

1. Export the approved screenshot from Figma at 2x as PNG, or use the original uploaded screenshot.
2. Put raw files in a local directory such as `assets/raw`.
3. Convert and resize them:

   ```bash
   WEBP_QUALITY=82 IMAGE_MAX_WIDTH=1920 \
   npm run images:optimize -- assets/raw public/media/optimized
   ```

4. Update the related image entry in `src/content/site-content.ts`, for example:

   ```ts
   image: {
     src: "/media/platforms/operator-dashboard-v2.webp",
     alt: "Casino operator dashboard showing players and revenue",
     width: 1600,
     height: 1000
   }
   ```

Always use the real exported pixel width and height. Next.js uses them to reserve the aspect ratio and prevent cumulative layout shift. Use versioned filenames when replacing public media so long-lived browser and Caddy caches cannot serve an old screenshot.

Keep true UI icons as small vector/CSS assets when appropriate. Use WebP for screenshot-like material—game scenes, admin panels, product interfaces and large decorative raster artwork—not for tiny icons that need infinite scaling.

## Configuring game artwork and demo links

Each item under `siteContent.gamesPage.catalog.games` stores its actions and can optionally replace the lightweight themed artwork with an optimized image:

```ts
{
  id: "neon-rush",
  title: "Neon Rush",
  image: {
    src: "/media/demos/neon-rush.webp",
    alt: "Neon Rush crash game interface",
    width: 1200,
    height: 1200
  },
  primaryAction: {
    label: "Play Demo",
    href: "https://demo.aureviagaming.com/neon-rush",
    external: true
  }
}
```

When `image` is omitted, the card uses its configured `artworkTone` and `symbol` without adding an image request. External action URLs are detected automatically by the shared link component.

## Configuring casino platform previews

The Casino Platforms page renders its operator overview, admin dashboard and RTP panel as lightweight code-native previews by default. Their labels, metrics, charts, profiles and activity rows are stored under `siteContent.platformPage`.

Each preview also accepts an optional optimized image override in `site-content.ts`:

```ts
overview: {
  image: {
    src: "/media/platforms/operator-overview-v2.webp",
    alt: "Operator overview showing revenue, players and RTP",
    width: 1600,
    height: 1200
  },
  // Remaining preview content...
}
```

The same `image` field is available on `platformPage.admin.dashboard` and `platformPage.rtp.panel`. When present, the shared platform visual component renders it with `next/image`, responsive `sizes` and intrinsic dimensions. When omitted, no image request is added.

## Contact form delivery

The form submits to `/api/contact` with an accessible client-side status flow. It requires Cloudflare Turnstile, validates the token again on the server, checks the expected hostname and action, validates required fields, checks production origins, includes a honeypot, and supports two server-side delivery methods.

Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and
`TURNSTILE_ALLOWED_HOSTNAMES` as shown in `.env.example`. The public site key is
embedded at build time; the secret remains server-only.

Contact-page labels, field placeholders, project types, budget choices, status messages and supporting sections are configured under `siteContent.contactPage`. Keep those options synchronized there; the form and server-side project-type validation both read from the same source.

### Telegram Bot delivery

Create a Telegram bot, add it to the destination chat, and set:

```dotenv
TELEGRAM_BOT_TOKEN=replace_me
TELEGRAM_CHAT_ID=replace_me
```

### Generic webhook delivery

```dotenv
CONTACT_WEBHOOK_URL=https://your-secure-endpoint.example/contact
CONTACT_WEBHOOK_BEARER_TOKEN=optional_secret
```

Telegram is attempted first. If it is not configured, the route uses the webhook. When neither method is configured, the contact page tells the visitor to use the direct Telegram link instead of pretending the message was delivered.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

Or run all three:

```bash
npm run check
```

## Automated deployments

Pull requests merge into `dev`, which deploys to the Access-protected staging
site. A successful staging deployment creates or updates the `dev` to `master`
promotion pull request and enables auto-merge; production deploys only after
the required owner approval. See [`ops/AUTO-DEPLOY.md`](ops/AUTO-DEPLOY.md) for
the complete GitHub, VPS, Nginx and Cloudflare setup.

## Create a VPS release

```bash
npm run release
```

This builds and verifies the application, copies the minimal Next.js standalone server, static build output and public files, then creates:

```text
release/aurevia-gaming-YYYYMMDD-HHMMSS.tar.gz
```

The standalone copy is important: `.next/standalone` does not automatically include `public` or `.next/static`, so the release script adds both explicitly.

## First-time VPS setup

These commands assume Ubuntu, an existing Node.js 24 installation at `/usr/bin/node`, and Caddy already installed.

```bash
sudo useradd --system --home /var/lib/aurevia --create-home --shell /usr/sbin/nologin aurevia
sudo install -d -o aurevia -g aurevia /var/www/aurevia-gaming/releases
sudo install -m 0644 ops/aurevia-gaming.service /etc/systemd/system/aurevia-gaming.service
sudo install -m 0600 .env.example /etc/aurevia-gaming.env
sudo systemctl daemon-reload
sudo systemctl enable aurevia-gaming
```

For the live Nginx/PM2 deployment, edit `/etc/aurevia-gaming/production.env` and add the production Turnstile, GA4, and contact delivery values. Keep this file owned by `deploy` and mode `0600`. The standalone systemd example below instead uses `/etc/aurevia-gaming.env`. Follow [`ops/CLOUDFLARE-PRODUCTION.md`](ops/CLOUDFLARE-PRODUCTION.md) for the current Cloudflare Free and GA4 account settings.

Add the contents of `ops/Caddyfile` to the active Caddy configuration. Do not overwrite other site blocks already on the server.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Port `3000` is bound to `127.0.0.1` and must not be publicly opened. After validating SSH access, restrict public HTTP and HTTPS at the VPS firewall to Cloudflare's published proxy ranges so traffic cannot bypass the WAF.

## Deploy a release

From your development machine:

```bash
scp release/aurevia-gaming-*.tar.gz root@YOUR_SERVER:/tmp/
scp ops/deploy-release.sh root@YOUR_SERVER:/tmp/
```

On the VPS:

```bash
sudo bash /tmp/deploy-release.sh /tmp/aurevia-gaming-*.tar.gz
```

The script creates a timestamped release, atomically updates `/var/www/aurevia-gaming/current`, restarts the systemd service, verifies `/api/health`, and retains the latest five releases.

Useful commands:

```bash
sudo systemctl status aurevia-gaming
sudo journalctl -u aurevia-gaming -f
curl -fsS http://127.0.0.1:3000/api/health
sudo caddy validate --config /etc/caddy/Caddyfile
```

## Rollback

List releases and repoint `current` to the last healthy one:

```bash
ls -1dt /var/www/aurevia-gaming/releases/*
sudo ln -sfn /var/www/aurevia-gaming/releases/PREVIOUS_RELEASE /var/www/aurevia-gaming/current.next
sudo mv -Tf /var/www/aurevia-gaming/current.next /var/www/aurevia-gaming/current
sudo systemctl restart aurevia-gaming
```

## Performance decisions

- Marketing content remains server-rendered; client JavaScript is limited to existing interactions, Turnstile, and the analytics-consent control.
- Content is local and build-time renderable; there are no data-fetch waterfalls.
- The only dynamic routes are the contact endpoint and health endpoint.
- Hero imagery is preloaded; below-the-fold images remain lazy by default.
- Every responsive image has an explicit `sizes` rule and intrinsic dimensions.
- WebP quality values are allowlisted in `next.config.ts`.
- `next/font` self-hosts the selected fonts, avoiding a render-blocking remote font request.
- `output: "standalone"` produces a minimal production server.
- Caddy applies Zstandard/Gzip compression and immutable caching to hashed Next.js assets.
- Security headers, origin checks and a non-public application port are included by default.
