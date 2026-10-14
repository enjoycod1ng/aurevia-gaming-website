# Website visual assets

Game previews use real Play’n GO artwork and gameplay captures from the prepared integration. The admin analytics screenshot is a branded design preview with explicitly labeled sample data.

| Placement | Active asset |
| --- | --- |
| Header and footer monogram | `src/components/brand-logo.tsx` |
| Favicon and manifest icon | `public/logo.svg` |
| Social sharing preview | `public/opengraph-image.png` |
| Home and games hero; slot service | `public/media/games/wildframes-gameplay.webp` |
| Home and games catalog cards | `public/media/games/{game-id}.webp` |
| Web/mobile service | `public/media/games/moonprincess-gameplay.webp` |
| Casino website service | `public/media/games/catalog-preview.webp` |
| Home, platform and admin service previews | `public/media/platforms/admin-analytics-preview.webp` |

`src/content/prepared-games.ts` is the shared nine-game catalog. It matches the current selected integration manifest, including original Honey Rush (`honeyrush`, game 375), not Honey Rush Black and Yellow.

Artwork provenance and screenshot reproduction notes are in `assets/README.md`. No fictional game fallback remains. Keep image dimensions and descriptive alt text in sync when replacing an asset.
