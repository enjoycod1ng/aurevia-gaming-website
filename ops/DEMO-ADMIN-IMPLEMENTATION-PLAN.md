# Public demos and administration implementation plan

Updated: 2026-09-14. Status: implemented, verified and deployed. The owner completed password and authenticator enrollment and opened the live administration workspace. Exact releases and acceptance evidence are recorded below.

## Outcome and order

Deliver isolated public game demos, remove public access to the integration lab, correct the themed dashboard preview, and provide a real authenticated administration workspace. Implement in the following order, then deploy the tested website and backend together. Existing accepted settlements and transaction history must survive the release and rollback.

### 1. Separate public demos from the private integration lab

- [x] Add a dedicated public-demo operator, separate from sandbox clients A/B, with explicit game assignments and deployment ownership configuration.
- [x] Bind each visitor to a cryptographically random, server-issued identity through an HttpOnly, SameSite cookie. Never accept a player ID, operator ID, starting balance, or provider credential from the browser.
- [x] Provision a new simulated account with exactly 1,000,000 minor units (10,000.00 EUR) for a new demo. Keep existing account/session state during retries and reconnection. Explicit restart creates a new account after closing the old session; it does not erase or reset unsettled funds.
- [x] Make launching idempotent, enforce visitor/session ownership, validate game and return URL, and apply durable request limits and bounded session capacity. Show capacity and service failures clearly.
- [x] Deny unauthenticated requests to every lab page, asset and helper endpoint. Replace Client A/B selection with an authenticated lab entry for administrators/integration staff.
- [x] Verify two visitors cannot read, launch or close each other's sessions. Verify retries do not duplicate provisioning or reset balances.

### 2. Open the selected game directly

- [x] Change game cards and showcase links to localized Open Demo routes for all nine published games.
- [x] Add a localized game player page with loading/error states, a clear simulated-credit notice, full-screen control, exit and restart. Start the selected game without an API-key form or client selector.
- [x] Preserve website language and theme. Website UI supports EN/ES/PT; game runtime remains within its currently qualified English/EUR scope.
- [x] Verify all nine native launch responses with a new 10,000.00 balance, then inspect all nine native game screens in the live browser. Automated verification placed no wagers. Existing visitor balances survived switching games; exiting released the owned session. Local layout, keyboard dialogs, failure states, isolation, expiry and reconnect/restart logic also passed.

### 3. Correct the dashboard preview in light mode

- [x] Replace the fixed dark pixels with a maintainable theme-aware preview using the website's typography and color tokens, or produce matching light/dark assets if existing presentation requires them.
- [x] Keep illustrative figures visibly labelled as sample data; do not imply the marketing preview is live reporting.
- [x] Verify both themes, system theme changes, translated labels and full-size viewing behavior.

### 4. Build the authenticated admin portal

Architecture: Next.js supplies the localized, responsive user interface. A dedicated Python portal service owns authentication, authorization, demo provisioning and management APIs, reusing the existing provider database/services. Provider credentials, wallet secrets and administration keys stay server-side. The public provider integration API retains its existing contract.

**Access and identity**

- [x] Add individual accounts with Argon2 password hashes, mandatory TOTP MFA, encrypted TOTP seeds, opaque expiring server-side sessions, logout/revocation and durable login throttling.
- [x] Bootstrap the first owner through a private one-time enrollment token. Never ship default passwords or automatically sign up a public administrator.
- [x] Enforce owner, manager and viewer permissions at each backend endpoint. Owners manage staff access; viewers cannot execute management operations. Audit actor, action, target, timestamp and non-secret changes.
- [x] Require exact-origin CSRF protection for writes, no-store responses, no indexing, and server-side validation. Bound lists and exports. Never return password hashes, callback secrets, internal error payloads or raw existing API keys.

**Workspace and data**

- [x] Overview: real operator/session totals, pending settlement counts, runtime/recovery health, capacity and maintenance state. Clearly identify sandbox and demo activity and show when data was refreshed.
- [x] Clients: search/inspect clients, assigned games, allowed origins, currencies and credential status. Expose supported activation/suspension, game assignment and safe credential issuance/revocation with explicit confirmation and audit history.
- [x] Sessions and transactions: filter by client, game, status and date; inspect safe record details and pending obligations. Support bounded CSV exports using the same filters and protect spreadsheet cells from formula interpretation.
- [x] Reports: aggregate verified settled activity by currency and date; distinguish bets, payouts and reversals. Exclude unresolved transactions from settled totals. Do not invent net profit, client wallet balances, or revenue-share terms.
- [x] Operations: maintenance, existing bounded capacity controls and recovery visibility. Changes must preserve accepted settlement obligations. No delete/reset ledger control.
- [x] Audit and staff: browse actual operator/deployment/admin events; owner-only staff invitations/revocation. Provide a documented host recovery path for lost MFA.
- [x] Deliver EN/ES/PT labels, light/dark/system theme, usable tables on small screens, consistent 44px controls, visible focus, empty/loading/error states and accessible labels.

### 5. Verify and deploy

- [x] Add meaningful backend tests for access control, MFA/replay, expiry/revocation, CSRF, visitor isolation, wallet provisioning, launch idempotency, data filters, aggregates, CSV safety and audited management actions.
- [x] Run existing provider regression tests and website typecheck/lint/tests/production build. Verify migrations preserve existing records and fail closed when portal secrets are missing.
- [x] Exercise the local website in EN/ES/PT and both themes, including admin login and the public demo flow against an isolated fixture. Verify native launching on the live isolated operator after installation. Inspect live client records, overview, reports and the light dashboard preview.
- [x] Package an immutable backend release with explicit dependencies, new service configuration, migration, private bootstrap instructions, health checks and rollback steps. Preserve current database volumes and existing credentials.
- [x] Deploy backend using the authorized root console, verify routes/authentication/health, then deploy the matching website through staging and production workflows. Restore initial maintenance state and preserve the existing capacity limits, database storage and qualified runtime images.
- [x] Verify live anonymous lab denial, 10,000-credit public demos, authenticated management data, themes/translations, CDN/media behavior and localized docs. Record exact revisions and evidence.

## Current constraints and decisions

- Backend installation used the authorized root console; website releases used the existing restricted deploy account and GitHub workflows. The website deploy account did not receive Docker or general root access.
- Existing public sandbox is a small single-VPS deployment: four concurrent sessions globally and two per operator. Public availability is bounded by these limits; show a useful busy state instead of silently increasing load.
- This release does not qualify real-money production clients, new runtime currencies/languages, off-host disaster recovery, billing or automated external notifications.
- A client whose callback secret or deployment scope has not been installed cannot be activated through an attractive but nonfunctional form. Onboarding must expose and validate these prerequisites.
- The previous seven website/documentation improvements are preserved. Legacy documentation redirects are installed. Public metadata/canonicals/language alternates passed on all 21 localized pages, all nine artwork images loaded, and a versioned image returned a Cloudflare cache HIT. EN/ES/PT guides retain working Node.js, PHP, C# and Java selectors and downloads. Saved language preferences, browser language and the Cloudflare country fallback remain in place.

## Reference material

- Installed Next.js authentication and route-handler guides under `node_modules/next/dist/docs/01-app/`.
- Argon2: https://argon2-cffi.readthedocs.io/en/stable/
- TOTP and replay prevention: https://pyauth.github.io/pyotp/
- Encryption of MFA seeds: https://cryptography.io/en/stable/fernet/

## Execution log

- 2026-09-14: Confirmed clean website checkout, deployed revision a54fefb3e3c8, existing admin CLI and private diagnostics, absence of a real admin UI, and root-only backend deployment boundary. Plan created; implementation has started.

- 2026-09-14: Implemented isolated visitor demos, direct localized demo routes, retirement of all public lab routes, theme-aware preview and a separate staff administration workspace. Staff auth includes password/MFA, role enforcement, revocation, recovery and serialized OTP consumption. Administration includes actual reports/history, safe exports, client/key controls, operations and staff audit.
- 2026-09-14: Local backend regression: **171 passed, 2 PostgreSQL-only skips**. Website: **19 tests passed**, TypeScript, lint and production build passed. Root preparation runs the complete backend suite against the dedicated PostgreSQL test database.
- 2026-09-14: Browser verified local owner sign-in, actual client data and typed confirmation dialog, EN/ES/PT administration, compact 390px mobile navigation, light/dark modes and full-size theme-aware preview including Escape dismissal. Local fixture contains no production credentials or real funds.
- 2026-09-14: Backend source archive uploaded and remote checksums verified. Archive SHA-256: `16d2b3fd16248eb7e76c6f2197b0728e385813ca62f9cd350bf71764397fd158`. Installer SHA-256: `72a25001d8ee57703a78376052a4e7983131c904bb5c82fb381cce539ae198d0`. Files are in `/home/deploy/aurevia-incoming/`. Private bootstrap, maintenance, snapshots, immutable image pinning, safe containment and recovery instructions are in backend `docs/28-public-demo-admin-release.md`.
- 2026-09-14, before installation: Requested root-console sign-in after the tested release was concrete and uploaded. No live routes had changed at that point.
- 2026-09-14: Root preparation passed **171 PostgreSQL-backed tests**, with two Node-dependent checks skipped because the native base image has no Node executable; those two checks passed locally. Apply waited for existing rounds to settle, took database snapshots and deployed the portal without restoring or discarding accepted activity. Both databases and all qualified native/runtime/recovery image IDs were preserved.
- 2026-09-14: All nine HTTP launch checks passed with 10,000.00 starting balances, valid native session markup and zero automated wagers. Browser inspection covered Wild Frames, Honey Rush, Moon Princess, Wheel of Mictlan, Secret of Dead, Legacy of Egypt, Hugo’s Adventure, Troll Hunters 2 and Demon. All nine updated catalog artwork images loaded.
- 2026-09-14: The user activated the private owner invitation with their own password and authenticator. Live administration displayed three configured clients, actual session/history totals, settled reports, healthy services and no pending settlements. Existing clients A/B remain explicit integration test records in authenticated administration; the public client selector and shared lab helpers are retired.
- 2026-09-14: Final read-only public checks passed for 21 localized pages, anonymous lab/assets/helpers/admin denial (401), all four language examples and the integration ZIP (200), legacy docs redirect to `/en/docs`, and versioned Cloudflare media caching (HIT). Local TypeScript, lint, **19 website tests** and production build passed again after removing obsolete lobby instructions in EN/ES/PT.

## Deployed release and evidence

- Backend: `/opt/PlaynGo_Integration/releases/aurevia-portal-1.0.0-16d2b3fd1624`; portal image `sha256:2030b55ba71bd2980b0c70100819f3607519f9619fae53997c26eeea10a2e847`. The portal runs as `10001:10001` with a read-only root filesystem.
- Website: `702a8b76e2d1484bce1d8e4743ecb120f29bc054` on `feature/public-demo-admin`, including implementation commit `d3e4a89a50cb856bb7eb75a03484e571cbbcc80e` and the final localized catalog copy correction.
- [Successful staging release](https://github.com/enjoycod1ng/aurevia-gaming-website/actions/runs/34829793551) and [successful production release](https://github.com/enjoycod1ng/aurevia-gaming-website/actions/runs/34829941874). Both loopback health endpoints returned the exact deployed website revision.
- Root-only evidence: `/opt/PlaynGo_Integration/shared/portal-release-evidence.json` and `/opt/PlaynGo_Integration/shared/portal-operational-verification.json`. Local API-workspace evidence: `.audit/portal-release/website-release.json` and `.audit/portal-release/public-website-verification.json`.
- Recovery and containment: API-workspace `docs/28-public-demo-admin-release.md`. Do not restore a pre-release database snapshot over accepted newer transactions. This checklist update documents the deployed code; it does not require another application deployment.
