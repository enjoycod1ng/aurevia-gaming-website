import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = siteContent.navigation.map((item) => item.href);

  return routes.map((path, index) => ({
    url: new URL(path, siteContent.brand.url).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/contact" ? 0.8 : 0.7,
  }));
}
