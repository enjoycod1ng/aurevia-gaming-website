# Website visual assets

The current home hero, demo cards and platform dashboards are rendered with HTML, CSS and SVG. They do not use screenshot files.

| Placement | Active asset |
| --- | --- |
| Header and footer monogram | `src/components/brand-logo.tsx` |
| Favicon and manifest icon | `public/logo.svg` |
| Social sharing preview | `public/opengraph-image.png` |
| Slot development service | `public/media/services/slot-development.webp` |
| Web/mobile service | `public/media/services/web-mobile-casino.webp` |
| Casino website service | `public/media/services/casino-website.webp` |
| Admin platform service | `public/media/services/admin-platform.webp` |

The service screenshots remain sample artwork. Replace them with approved exports and update their dimensions and descriptions in `src/content/site-content.ts`.

Game catalog cards and platform previews retain documented optional image overrides. Add versioned optimized assets when enabling those overrides; see the README. Removed screenshots from earlier layouts are available in Git history.
