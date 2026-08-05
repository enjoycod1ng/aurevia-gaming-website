# Aurevia Gaming — Next.js website

A production-oriented, configuration-driven marketing website for `aureviagaming.com`.

The project uses the Next.js App Router, React Server Components, TypeScript, local WebP media, responsive image optimization, server-rendered metadata, a no-client-JavaScript contact form, and standalone VPS deployment behind Caddy.

## Stack

- Next.js 16.2.11
- React 19.2.8
- TypeScript
- Plain global CSS with design tokens; no runtime CSS library
- Sharp for self-hosted image optimization and the included WebP conversion script
- Node.js 24 LTS on the VPS
- Caddy for HTTPS, HTTP/2/HTTP/3, reverse proxying and compression
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
- Demo cards and live demo URLs
- Casino platform modules
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

## Adding live demo links

Each item under `siteContent.demos` accepts an optional `demoUrl`:

```ts
{
  id: "neon-forge",
  title: "Neon Forge",
  // ...
  demoUrl: "https://demo.aureviagaming.com/neon-forge"
}
```

When `demoUrl` is absent, the card sends the visitor to the quote form. When it is present, the card automatically renders an external live-demo action.

## Contact form delivery

The form POSTs directly to `/api/contact`; it does not require a client component or browser JavaScript. It validates required fields, checks production origins, includes a honeypot, and supports two server-side delivery methods.

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

Edit `/etc/aurevia-gaming.env` and add production contact delivery credentials. Keep this file owned by root and mode `0600`.

Add the contents of `ops/Caddyfile` to the active Caddy configuration. Do not overwrite other site blocks already on the server.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

The public firewall should expose only SSH, HTTP and HTTPS. Port `3000` is bound to `127.0.0.1` and must not be publicly opened.

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

- Marketing pages use Server Components with no custom client components or hydration state.
- Content is local and build-time renderable; there are no data-fetch waterfalls.
- The only dynamic routes are the contact endpoint and health endpoint.
- Hero imagery is preloaded; below-the-fold images remain lazy by default.
- Every responsive image has an explicit `sizes` rule and intrinsic dimensions.
- WebP quality values are allowlisted in `next.config.ts`.
- The app uses system fonts, avoiding a render-blocking remote font request.
- `output: "standalone"` produces a minimal production server.
- Caddy applies Zstandard/Gzip compression and immutable caching to hashed Next.js assets.
- Security headers, origin checks and a non-public application port are included by default.
