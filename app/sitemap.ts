import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPublishedReels } from "@/lib/reels";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reels = await getPublishedReels();
  return [
    { url: SITE.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/reels`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...reels.map((r) => ({ url: `${SITE.url}/reels/${r.id}`, lastModified: r.publishedAt ? new Date(r.publishedAt) : undefined, priority: 0.6 })),
  ];
}
