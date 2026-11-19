import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ReelsGallery from "@/components/ReelsGallery";
import { getReels } from "@/lib/reels";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Reels",
  description: "Makeup looks and photo sessions by ADGlam in Buea: glam, bridal, natural, events and content. Watch the latest reels.",
  alternates: { canonical: "/reels" },
};

export default async function ReelsPage() {
  const reels = await getReels();
  return (
    <>
    <main>
      <SiteNav />
      <section className="block top">
        <h1 className="h2">Reels</h1>
        <p className="lede">Looks and shoots from real sessions. Open a reel to watch it, share it or book something similar.</p>
        <ReelsGallery reels={reels} />
      </section>
      <section className="block book">
        <h2 className="h2">Like what you see?</h2>
        <p className="lede">Book a makeup or photo session. We come to you.</p>
        <div className="contact"><Link className="btn" href="/#book">Book a session</Link></div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
