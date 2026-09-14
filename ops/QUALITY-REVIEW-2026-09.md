# September 2026 website quality pass

## Implemented in the working tree

- English, Spanish and Portuguese server-rendered pages, translated forms, privacy copy, status messages, accessible labels and image descriptions. Product names and form API values remain stable.
- Explicit locale URLs, permanent legacy English redirects, uncached homepage preference negotiation, locale-aware metadata, reciprocal hreflang and 18 sitemap entries. Removed artificial `lastModified: new Date()` entries.
- Organization, website, page, breadcrumb, service, game catalog and visible FAQ structured data. No invented ratings, pricing, customer counts or results were added.
- Shared light/dark/system color tokens, a persistent theme button, readable type sizes, reusable button/form styles, larger interactive targets, keyboard menu dismissal and narrow-screen overflow fixes.
- Content-hashed versions of 13 images (753,734 bytes), a generated image manifest, dimension/checksum tests and a repeatable `images:version` command.

## CDN delivery completed

The existing CDN is Cloudflare in front of the website VPS. The 13 versioned images
were uploaded additively into the existing production release's public media folder.
Existing files and the production application revision were preserved. Only the
`aurevia-gaming` PM2 process was reloaded to refresh Next.js's public-file inventory.
All 13 public HTTPS responses were 200, matched their SHA-256 hashes and reported
`CF-Cache-Status: HIT`. The production homepage was verified in a browser after the
reload. The application revision remains `fc2a1b4634228135b968f41b76794ff25eb1145f`.

This media upload does not publish the new UI or language routes. Those code changes
need the normal Linux/Node 24 release flow through staging and production promotion.
The current live homepage still contains older placeholder content; promoting the
reviewed project will replace that content with the prepared catalog and clearly
labeled analytics preview.

## Validation and operational limits

- TypeScript, ESLint, 12 automated tests, production build, and HTTP checks of all
  18 localized pages, canonicals, hreflang, sitemap, preference/legacy redirects,
  unknown routes, query edge cases and invalid form rejection.
- Extracted standalone archive smoke test: localized routes, 30 assets, native
  Sharp optimization, metadata and invalid contact submission rejection all passed.
  This locally built Windows archive is a verification artifact, not a Linux release.
- Browser checks at desktop and 390px/320px mobile widths: theme persistence,
  language switching, Escape dismissal, game filters, translated contact labels,
  16px form inputs and no page overflow at the narrowest width.
- Local Turnstile configuration has no public key, so the unavailable state was
  checked. No inquiry was sent to Telegram or a webhook, and no live CAPTCHA was
  solved. Test an actual submission with the deployment's configured Turnstile key
  as part of normal release acceptance.
- Non-browser requests to production HTML currently receive Cloudflare's managed
  challenge; image requests do not. The browser homepage succeeds. Before making
  search/AI visibility claims, verify real crawler access in Cloudflare and Search
  Console. A challenged generic HTTP client does not prove that verified search
  bots are blocked. Do not broadly disable security rules.
- A native-language editorial review of commercial copy is useful before launch.
  Game and dashboard screenshots are intentionally not translated or recolored.

## SEO and generative search rationale

The work makes content indexable, descriptive, internally linked and consistent
with its structured data. Google documents that its AI search features use the
same SEO foundations and require no special AI files or special schema:
[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).
Separate locale URLs and explicit alternatives follow
[Google's multilingual site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).
Neither these changes nor structured data guarantee ranking, AI citations or FAQ
rich results. Future content improvements should use real project examples,
approved technical evidence and specific service answers rather than invented
social proof.


## Developer portal extension — 2026-09-14

Added `/en/docs`, `/es/docs` and `/pt/docs`, linked from the main navigation and
21-URL sitemap. Thirteen contract sections cover authentication, catalog, launch,
iframe sessions, signatures, money precision, idempotency, rollback, recovery,
reconciliation, error handling, acceptance and upgrades. Shared theme/control
styles, collapsible mobile contents, language-specific metadata and TechArticle
structured data use the same page content. Programming-language choice persists
locally; the language selector for prose continues to use the site preference.

The downloadable kit has Node.js, PHP, C#/.NET 8 and Java 17/Jackson examples,
OpenAPI contracts, Postman and three complete offline HTML guides. The API source
exporter allowlists 28 public files so local builds, secrets and wallet journals
cannot enter the public ZIP. The stale platform compatibility document was corrected
from the old 0.5.2/1.0.0 status to the published sandbox 1.0.1 contract.

Node.js and PHP offline tests pass. C# and Java compile and pass the same HMAC
fixture, exact-body tampering, past/future clock skew, uppercase signature,
operation/request/operator mismatch, Unicode identity and HTTPS requirement tests.
They do not submit live launches or mutate any wallet. The portal explicitly
separates translated documentation from the currently English-only game API.

Website checks now include 15 automated tests and all 21 localized HTTP pages.
The existing preview process retained an old sitemap module after a content edit;
the production build already contained 21 entries and restarting the preview
resolved the development-only discrepancy.

The user has authorized live publication after verification. The production GitHub
environment was inspected: no deployment branch restriction or environment review
gate is configured. The supported manual production workflow can publish the
verified staging branch ref without changing protected master/dev branches.
Deployment revision and public verification are recorded below when complete.
