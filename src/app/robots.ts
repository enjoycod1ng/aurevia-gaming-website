import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"]
    },
    sitemap: `${siteContent.brand.url}/sitemap.xml`,
    host: siteContent.brand.url
  };
}
