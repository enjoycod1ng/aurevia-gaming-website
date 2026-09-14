# Aurevia Gaming — Next.js website

A production-oriented, configuration-driven marketing website for `aureviagaming.com`.

The project uses the Next.js App Router, React Server Components, TypeScript, local WebP media, responsive image optimization, server-rendered metadata, a Turnstile-protected contact form, consent-gated GA4, and standalone VPS deployment behind Cloudflare. Production currently uses Nginx and PM2; the Caddy and systemd files under `ops/` document the planned standalone migration.

## Stack

- Next.js 16.3.5
- React 19.2.8
- TypeScript
- Tailwind CSS 4 with CSS-first theme tokens and a minimal global base layer
- Sharp for self-hosted image optimization and the included WebP conversion script
- Node.js 24 LTS on the VPS
- Nginx and PM2 on the live VPS; Caddy and a standalone systemd unit are available for a future migration
- Cloudflare Free for DNS, CDN, WAF, DDoS protection, rate limiting and Turnstile
- Google Analytics 4 behind an explicit analytics-consent control

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
contains the Tailwind import, shared design tokens, base element defaults,
and progressively enhanced scroll-reveal behavior. Content stays visible without JavaScript. Tailwind 4 discovers source classes
automatically, so the project does not require a `tailwind.config.js` file.

## Local development

Node.js 24 is recommended so local and production runtimes match.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

The committed lockfile supports deterministic `npm ci` installs in CI and on release builders.

## Configurable content

Edit `src/content/site-content.ts` to change:

- Brand and contact information
- Header and footer navigation
- Page titles, descriptions, CTAs and SEO keywords
- Services and capability lists
- Prepared game catalog, format filters, real artwork and sandbox links in `src/content/prepared-games.ts`
- Casino platform modules, reporting copy and the sample-data analytics preview
- Contact-page copy, quote fields, project types, proof points, process steps and common questions
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

## Game catalog and analytics preview

The home showcase and Games page share the nine titles in `src/content/prepared-games.ts`. Each game requires real artwork with intrinsic dimensions. Formats are Grid Slots and Video Slots. The sandbox button opens the existing Aurevia integration lobby, where visitors select a title and use a simulated wallet; it does not launch a session automatically.

The catalog is limited to the nine games selected by the integration release manifest. In particular, original Honey Rush (game 375) must not be replaced with Black and Yellow artwork. Aurevia is identified as the integration provider, and Play’n GO as the game provider.

`src/content/platform-preview.ts` defines the shared admin analytics screenshot. It is a **design preview with sample data**, not a live financial dashboard. It separates client wallet snapshots, period bets/payouts, client GGR, Aurevia revenue share and client results after share. Every placement carries a sample-data caption; the home and platform previews open the full-size image in a new tab.

The editable HTML source, asset origins and screenshot reproduction instructions are documented in [assets/README.md](assets/README.md). The old generated game symbols, invented game titles, code-only dashboard fixtures and four service mockup images have been removed.

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
npm test
npm run build
```

Or run all checks:

```bash
npm run check
```

## Deployments and release verification

The active deployment uses Nginx, PM2 and the Next.js standalone server on Node.js 24.

- Pull requests merge into `dev`, which deploys to public staging at `staging.aureviagaming.com`.
- A successful `dev` deployment prepares a promotion PR. Production changes require a manual approved merge into `master`.
- Push a `staging/**` branch to verify a candidate on the staging VPS without preparing production promotion. These runs share the staging site and deployment concurrency group.
- Once the updated workflow is on the default branch, a manual staging workflow dispatch can also verify a selected ref.
- Staging uses noindex headers and a disallowing robots file; it is not protected by Cloudflare Access.

See [ops/AUTO-DEPLOY.md](ops/AUTO-DEPLOY.md) for account setup, environment variables, protected branches and recovery.
Runtime secrets stay in `/etc/aurevia-gaming/staging.env` and `/etc/aurevia-gaming/production.env`.
The root-owned `/usr/local/sbin/aurevia-deploy` helper is installed separately and must not be overwritten by a workflow.

Build a release on **Linux with Node.js 24** so native dependencies match the VPS:

```bash
npm run release
```

This installs the locked dependencies, checks types and lint, runs tests, builds the site,
and packages `release/aurevia-gaming-YYYYMMDD-HHMMSS.tar.gz` plus its SHA-256 checksum.
It then extracts that archive into a temporary directory and starts the packaged server.
The smoke check verifies pages, static assets, native Sharp image optimization, metadata,
contact query edge cases, and rejection of invalid form submissions. It never delivers contact messages.

For an existing build:

```bash
npm run release:package -- release/candidate.tar.gz
npm run release:verify -- release/candidate.tar.gz
```

Git Bash can package a Windows build for local verification, but that artifact must not be deployed to Linux.
GitHub Actions builds and verifies a Linux archive before uploading it to the VPS.
The package includes `public` and `.next/static`, which Next.js does not copy into standalone output automatically.

The deployment helper takes three arguments:

```bash
sudo /usr/local/sbin/aurevia-deploy staging /home/deploy/aurevia-incoming/ARCHIVE.tar.gz COMMIT_SHA
```

Use `scripts/deploy-vps.sh` or the workflow to upload the archive and checksum together.
The helper switches the release symlink, restarts PM2, checks the exact revision and environment
through the origin health endpoint, and rolls back automatically if startup fails.
It retains five releases. Keep app ports 3000 and 3001 bound to localhost behind Nginx.

The Caddy and standalone systemd files under `ops/` are optional migration examples,
not the active deployment procedure.

## Performance decisions

- Marketing content remains server-rendered; client JavaScript is limited to existing interactions, Turnstile, and the analytics-consent control.
- Content is local and build-time renderable; there are no data-fetch waterfalls.
- The contact page and API endpoints are dynamic; the other marketing pages are prerendered.
- Game and platform hero images are preloaded. Catalog and service images use responsive sizes and lazy loading. Artwork is served locally as optimized WebP.
- Every responsive image has an explicit `sizes` rule and intrinsic dimensions.
- WebP quality values are allowlisted in `next.config.ts`.
- `next/font` self-hosts the selected fonts, avoiding a render-blocking remote font request.
- `output: "standalone"` produces a minimal production server.
- Scroll animations only observe newly added subtrees and skip the first screen, reduced motion and unsupported browsers.
- Security headers, origin checks and a non-public application port are included by default.
