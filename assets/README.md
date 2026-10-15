# Website imagery

## Prepared games

`public/media/games/` contains the nine Play’n GO panel images used by both the home and Games pages. `game-artwork-sources.json` records the original provider page and image URL for every title. The references come from the saved master catalog in the adjacent `Play’nGo_Games` project. Images are downloaded once, encoded as 500×350 WebP, and served locally; the website makes no runtime requests to the provider’s image host.

The catalog follows the nine-game integration release 1.0.1 manifest. Original Honey Rush (`honeyrush`, game ID 375) uses its matching panel; it is not the Black and Yellow sequel. Play’n GO remains the identified game provider. These are integration examples, not claims that Aurevia created the games or their artwork.

The 1366×768 Moon Princess gameplay image was exported as WebP from the prepared project’s `output/provider-ui-click-audit/moonprincess/before-spin.png` capture. Its displayed balance is a simulated sandbox balance. The catalog preview is a browser capture of the updated website’s game library.

The Wild Frames gameplay image is a capture of the public demo with a fresh 10,000-credit balance, matching the copy beside it. Each capture launches a real demo session, and the headless browser does not reliably release it: the session keeps one of the public demo's seats until the backend's 30-minute idle timeout. Capture at a quiet time, and only once. To reproduce it, run:

```bash
node scripts/capture-page.mjs https://aureviagaming.com/en/demo/wildframes wildframes-gameplay.png 1366x768 --fill 'iframe[title$="Game demo"]' --wait 20 --click 683,640 --click 683,640
WEBP_QUALITY=82 IMAGE_MAX_WIDTH=1920 npm run images:optimize -- <folder with the PNG> public/media/games
npm run images:version
```

The two clicks dismiss the game’s feature-preview screen; the first only unlocks audio. Check the result before committing: it must show the game grid, “PRESS SPIN TO BEGIN” and a 10000.00 balance.

## Admin analytics screenshot

The source is `source/admin-analytics-preview.html`. It is a static, editable **design preview**, not an admin application or a connection to a live wallet. All three clients and their financial values are illustrative. No credentials, player identifiers or real client data are included.

The source calculates the displayed values in integer cents. Client GGR is settled bets minus payouts; Aurevia’s share uses the illustrated rate for each client; the remaining client result is GGR minus that share. The seven chart values sum to the displayed share total. Wallet balances are separate snapshots. The screenshot labels the share as revenue before operating costs and taxes, rather than net profit.

To reproduce it:

1. Serve the repository root with a local static HTTP server.
2. Open `/assets/source/admin-analytics-preview.html` with a CSS viewport of **1440×1120**. Confirm all three images have loaded and the page has no overflow.
3. Capture the viewport at its native dimensions. Use the full-resolution screenshot, not a thumbnail export.
4. Encode as WebP and save to `public/media/platforms/admin-analytics-preview.webp`. Update `src/content/platform-preview.ts` if the dimensions change.

The source HTML is outside `public/`, so it is not shipped as a public admin route. The marketing pages use the optimized screenshot and a visible sample-data caption. They offer a full-size view for readability on smaller screens.

## Link-preview images

`public/og/aurevia-gaming-{en,es,pt}.jpg` are the Open Graph and X images for each language. The source is `source/opengraph-image.html`; `?lang=es` or `?lang=pt` selects the copy, which follows the homepage hero. It loads Sora and Manrope from Google Fonts and the Wild Frames capture from `public/media/games/`. Render all three with:

```bash
for lang in en es pt; do
  node scripts/capture-page.mjs "file://$PWD/assets/source/opengraph-image.html?lang=$lang" "public/og/aurevia-gaming-$lang.jpg" 1200x630
done
```

Keep each file under about 300 KB, which WhatsApp needs for a preview. Chat apps cache previews by image URL, so give the files new names when the design changes and update `src/lib/metadata.ts`.
