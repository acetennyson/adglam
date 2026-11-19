import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import ReelFeed from "@/components/ReelFeed";
import { getPublishedReels, getReel } from "@/lib/reels";
import { embedSrc, type Platform } from "@/lib/embed";
import { SITE } from "@/lib/site";
import { city } from "@/lib/contact";

export const revalidate = 60;
type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getReel(params.id);
  if (!r) return { title: "Reel not found", robots: { index: false } };
  const description = `${r.title}: a ${r.category.toLowerCase()} look by ${SITE.name}, makeup and mobile photography in ${city}.`;
  return {
    title: r.title, description, alternates: { canonical: `/reels/${r.id}` },
    openGraph: { type: "website", url: `/reels/${r.id}`, title: r.title, description, ...(r.cover ? { images: [r.cover] } : {}) },
    twitter: { card: "summary_large_image", title: r.title, description, ...(r.cover ? { images: [r.cover] } : {}) },
  };
}

export default async function ReelPage({ params }: Props) {
  const reels = await getPublishedReels();
  const r = reels.find((x) => x.id === params.id);
  if (!r) notFound();
  const jsonLd = r.cover && r.publishedAt ? {
    "@context": "https://schema.org", "@type": "VideoObject", name: r.title, description: `${r.title}, a ${r.category.toLowerCase()} look by ${SITE.name} in ${city}.`,
    thumbnailUrl: [r.cover], uploadDate: r.publishedAt, embedUrl: embedSrc(r.platform as Platform, r.externalId!, false),
  } : null;
  return (
    <main className="feed-page">
      <SiteNav />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ReelFeed reels={reels} startId={r.id} siteUrl={SITE.url} />
    </main>
  );
}
