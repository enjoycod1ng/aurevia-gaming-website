# Website media

The included `.webp` files are lightweight sample screenshots so the project runs before final Figma exports are available.

## Replacing a screenshot

1. Export the approved game or admin screenshot from Figma at 2x as PNG, or use the original full-resolution screenshot.
2. Optimize it from the project root:

   ```bash
   npm run images:optimize -- assets/raw public/media/optimized
   ```

3. Either replace an existing file using the same path, or update the `src`, `width`, `height`, and `alt` fields in `src/content/site-content.ts`.
4. Use versioned filenames when a public image changes materially, for example `operator-dashboard-v2.webp`, to avoid stale VPS/browser caches.

## Recommended source dimensions

- Hero and platform screenshots: 1600×1000 or larger, matching a 16:10 ratio.
- Service screenshots: 1200×800 or larger, matching a 3:2 ratio.
- Demo cards: 1200×760 or larger.
- Do not enlarge small screenshots; re-export them from the source design.

The Next.js image component supplies responsive `srcset` values and reserves the configured aspect ratio to prevent layout shift.
