import { mediaPath } from "@/lib/media";
import type { MediaAsset } from "@/types/content";

export const analyticsPreviewImage: MediaAsset = {
  previewLabel: "Analytics platform · Sample data",
  openLabel: "View full size ↗",
  openAriaLabel: "Open the full-size admin analytics design preview (sample data, new tab)",
  src: mediaPath("/media/platforms/admin-analytics-preview.webp"),
  alt: "Aurevia admin analytics design preview with three sample clients: wallet balances, bets, payouts, client gaming results and Aurevia revenue share",
  width: 1440,
  height: 1120,
  caption: "Dashboard design preview · Sample clients and illustrative EUR figures. Aurevia revenue share is shown before operating costs and taxes.",
};
