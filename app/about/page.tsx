import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Portrait from "@/components/Portrait";
import { FOUNDER, SITE } from "@/lib/site";
import { city, country, reach } from "@/lib/contact";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `About ${FOUNDER.name}`,
  description: `Meet ${FOUNDER.name}, founder of ${SITE.name}: a makeup artist and photographer in ${city}, ${country} who turns glam into confidence and moments into memories.`,
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", url: "/about", title: `About ${FOUNDER.name} | ${SITE.name}`, description: `The story behind ${SITE.name}: makeup, photography and the belief that every woman should feel bold and seen.` },
};

const PILLARS = [
  ["Confidence first", "Makeup should never mask you. It should make you feel more like yourself, only bolder."],
  ["Craft with care", "Every look is built around your skin, your outfit and your occasion, never copied from a template."],
  ["Memories worth keeping", "The artist who creates your look also photographs it, so the feeling is captured while it is at its best."],
];
const STEPS = [
  ["We talk", "Your occasion, your outfit, your skin and the feeling you want to walk into the room with. A look begins as a conversation, not a brush stroke."],
  ["We prepare", "Skin comes first. Good preparation helps makeup sit smoothly and last through the day, whether it is a bridal morning or a night out."],
  ["We build", "Layer by layer, shaped to your features and to the light you will be in: glam, natural or bridal. Daylight and camera read colour differently, so we plan for both."],
  ["We reveal", "The mirror moment. We never rush it, because it is the part you will remember."],
  ["We capture", "While the look is at its best, we photograph it: portraits, events and lifestyle shots, edited to a high standard."],
];

export default function About() {
  const jsonLd = {
    "@context": "https://schema.org", "@type": "AboutPage", url: `${SITE.url}/about`, name: `About ${FOUNDER.name}`,
    mainEntity: {
      "@type": "Person", name: FOUNDER.name, jobTitle: FOUNDER.role, url: `${SITE.url}/about`, sameAs: [SITE.tiktok],
      worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
      address: { "@type": "PostalAddress", addressLocality: city, addressCountry: country },
      ...(FOUNDER.photo ? { image: `${SITE.url}${FOUNDER.photo}` } : {}),
    },
  };
  return (
    <>
      <main>
        <SiteNav />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="block top">
          <Breadcrumbs trail={[["Home", "/"], ["About", "/about"]]} />
          <div className="about-hero">
            <div>
              <p className="kicker">About</p>
              <h1 className="h1">{FOUNDER.name}</h1>
              <p className="role">{FOUNDER.role} · {city}, {country}</p>
              <p className="lede big">Beauty, to me, has always been a feeling before it is a look: standing a little taller, glancing in the mirror and thinking, <em>yes, that is me</em>.</p>
              <div className="adm-acts"><Link className="btn" href="/#book">Book a session</Link><Link className="btn ghost" href="/reels">See her work</Link></div>
            </div>
            <Portrait />
          </div>
        </section>

        <section className="block story">
          <h2 className="h2">Her story</h2>
          <p>I have always loved beauty. Doing my own makeup was my favourite kind of play: it was fun, and it made me feel bold and confident, fully myself.</p>
          <p>At first I learned makeup only for me. Later that joy turned into a business, and I love every part of the process, from the first conversation to the final blend.</p>
          <blockquote className="pull">“I love every process of it.”<cite>{FOUNDER.name}, founder of {SITE.name}</cite></blockquote>
          <p>Photography has always felt like the coolest kind of work to me. I genuinely enjoy it, and there is something special about capturing memories for people: the pause that turns a moment into something you get to keep.</p>
        </section>

        <section className="block">
          <h2 className="h2">What {SITE.name} stands for</h2>
          <div className="pillars">{PILLARS.map(([t, p]) => <div key={t} className="glass card"><h3>{t}</h3><p className="lede">{p}</p></div>)}</div>
        </section>

        <section className="block" id="process">
          <p className="kicker">The {SITE.name} process</p>
          <h2 className="h2">How a look comes together</h2>
          <p className="lede">There is no mystery to a glam you can trust, only care, in the right order. Here is what happens from hello to the final photograph.</p>
          <ol className="steps">{STEPS.map(([t, p], i) => (
            <li key={t} className="glass" style={{ ["--i" as any]: i }}><span className="num">{String(i + 1).padStart(2, "0")}</span><div><h3>{t}</h3><p>{p}</p></div></li>
          ))}</ol>
        </section>

        <section className="block">
          <blockquote className="pull">“{SITE.name} is a brand I wish to make big someday.”<cite>{FOUNDER.name}</cite></blockquote>
          <p className="lede">Until then, every client, every look and every photograph is part of building it, one beautiful detail at a time.</p>
        </section>

        <section className="block book cta-band">
          <h2 className="h2">Ready for your glam moment?</h2>
          <p className="lede">Tell us about your day. We come to you in {reach}.</p>
          <div className="contact"><Link className="btn" href="/contact">Send a message</Link><Link className="btn ghost" href="/makeup">Makeup</Link><Link className="btn ghost" href="/photography">Photography</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
