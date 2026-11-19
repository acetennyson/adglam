import Story from "@/components/Story";
import Reels from "@/components/Reels";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getReels } from "@/lib/reels";
import { HOME_REELS, SITE } from "@/lib/site";
import { phonePretty, tiktokHandle } from "@/lib/contact";

export const revalidate = 60; // re-fetch reels from the DB at most once a minute

export default async function Home() {
  const reels = await getReels(HOME_REELS);
  return (
    <>
    <main>
      <SiteNav />

      <div id="top"><Story /></div>

      <section id="services" className="block">
        <h2 className="h2">Two services, one artist</h2>
        <div className="two">
          <div className="glass card">
            <h3>Makeup</h3>
            <ul><li>Glam, natural and bridal</li><li>Special occasions</li><li>Photoshoots</li><li>On-location service</li></ul>
          </div>
          <div className="glass card">
            <h3>Mobile photography</h3>
            <ul><li>Portraits</li><li>Events</li><li>Lifestyle</li><li>Creative content</li><li>High-quality edits</li></ul>
          </div>
        </div>
        <p className="lede">Ideal for birthdays, dates, personal branding and content days. Home, office and events: {SITE.name} comes to you.</p>
      </section>

      <Reels reels={reels} />

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
