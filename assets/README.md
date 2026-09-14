# Website imagery

## Prepared games

`public/media/games/` contains the nine Play’n GO panel images used by both the home and Games pages. `game-artwork-sources.json` records the original provider page and image URL for every title. The references come from the saved master catalog in the adjacent `Play’nGo_Games` project. Images are downloaded once, encoded as 500×350 WebP, and served locally; the website makes no runtime requests to the provider’s image host.

The catalog follows the nine-game integration release 1.0.1 manifest. Original Honey Rush (`honeyrush`, game ID 375) uses its matching panel; it is not the Black and Yellow sequel. Play’n GO remains the identified game provider. These are integration examples, not claims that Aurevia created the games or their artwork.

The 1366×768 Wild Frames and Moon Princess gameplay images were exported as WebP from the prepared project’s `output/provider-ui-click-audit/{game}/before-spin.png` captures. Their displayed balances are simulated sandbox balances. The catalog preview is a browser capture of the updated website’s game library.

## Admin analytics screenshot

The source is `source/admin-analytics-preview.html`. It is a static, editable **design preview**, not an admin application or a connection to a live wallet. All three clients and their financial values are illustrative. No credentials, player identifiers or real client data are included.

The source calculates the displayed values in integer cents. Client GGR is settled bets minus payouts; Aurevia’s share uses the illustrated rate for each client; the remaining client result is GGR minus that share. The seven chart values sum to the displayed share total. Wallet balances are separate snapshots. The screenshot labels the share as revenue before operating costs and taxes, rather than net profit.

To reproduce it:

1. Serve the repository root with a local static HTTP server.
2. Open `/assets/source/admin-analytics-preview.html` with a CSS viewport of **1440×1120**. Confirm all three images have loaded and the page has no overflow.
3. Capture the viewport at its native dimensions. Use the full-resolution screenshot, not a thumbnail export.
4. Encode as WebP and save to `public/media/platforms/admin-analytics-preview.webp`. Update `src/content/platform-preview.ts` if the dimensions change.

The source HTML is outside `public/`, so it is not shipped as a public admin route. The marketing pages use the optimized screenshot and a visible sample-data caption. They offer a full-size view for readability on smaller screens.
