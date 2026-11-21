import Story from "@/components/Story";
import Reels from "@/components/Reels";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getReels } from "@/lib/reels";
import Link from "next/link";
import Portrait from "@/components/Portrait";
import ProofStrip from "@/components/ProofStrip";
import { FOUNDER, HOME_REELS, SITE } from "@/lib/site";
import { city, phonePretty, tiktokHandle } from "@/lib/contact";

export const revalidate = 60; // re-fetch reels from the DB at most once a minute

export default async function Home() {
  const reels = await getReels(HOME_REELS);
  return (
    <>
    <main>
      <SiteNav />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, alternateName: [SITE.name.replace(/^(AD)(Glam)$/i, "$1 $2")], url: SITE.url }) }} />

      <div id="top"><Story /></div>
      <ProofStrip />

      <section id="services" className="block">
        <h2 className="h2">Two services, one artist</h2>
        <div className="two">
          <div className="glass card">
            <h3>Makeup</h3>
            <ul><li>Glam, natural and bridal</li><li>Special occasions</li><li>Photoshoots</li><li>On-location service</li></ul>
            <p><Link className="more-link" href="/makeup">Explore makeup →</Link></p>
          </div>
          <div className="glass card">
            <h3>Mobile photography</h3>
            <ul><li>Portraits</li><li>Events</li><li>Lifestyle</li><li>Creative content</li><li>High-quality edits</li></ul>
            <p><Link className="more-link" href="/photography">Explore photography →</Link></p>
          </div>
        </div>
        <p className="lede">Ideal for birthdays, dates, personal branding and content days. Home, office and events: {SITE.name} comes to you.</p>
      </section>

      <Reels reels={reels} />

      <section className="block meet">
        <div className="about-hero">
          <div>
            <p className="kicker">The face behind {SITE.name}</p>
            <h2 className="h2">{FOUNDER.name}</h2>
            <p className="lede">Makeup artist and photographer in {city}. She started doing makeup for herself, fell in love with every part of the process, and now turns it into confidence you can see and memories you can keep.</p>
            <Link className="btn ghost" href="/about">Read her story</Link>
          </div>
          <Portrait />
        </div>
      </section>

      <section id="book" className="block book">
        <h2 className="h2">Book a session</h2>
        <p className="lede">Call or message to pick a date. Scheduling is flexible.</p>
        <div className="contact">
          <a className="btn" href={`tel:${SITE.phone}`}>Call {phonePretty()}</a>
          <a className="btn ghost" href="/contact">Send a message</a>
          <a className="btn ghost" href={SITE.tiktok} target="_blank" rel="noreferrer">TikTok {tiktokHandle()}</a>
        </div>
        <p className="small">Servicing {SITE.location}</p>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
