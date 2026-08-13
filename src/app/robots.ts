import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site-content";

export default function robots(): MetadataRoute.Robots {
  if (process.env.APP_ENV === "staging") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteContent.brand.url}/sitemap.xml`,
    host: siteContent.brand.url,
  };
}
