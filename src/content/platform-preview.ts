import { mediaPath } from "@/lib/media";
import type { MediaAsset } from "@/types/content";

export const analyticsPreviewImage: MediaAsset = {
  previewLabel: "Analytics platform · Sample data",
  openLabel: "View full size ↗",
  openAriaLabel: "Expand the dashboard preview in a dialog",
  src: mediaPath("/media/platforms/admin-analytics-preview.webp"),
  alt: "Aurevia admin analytics design preview with three sample clients: wallet balances, bets, payouts, client gaming results and Aurevia revenue share",
  width: 1440,
  height: 1120,
  caption: "Dashboard preview · Illustrative clients and sample activity. The authenticated admin workspace displays actual operating records.",
};
