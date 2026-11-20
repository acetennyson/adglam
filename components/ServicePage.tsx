import Link from "next/link";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { SITE } from "@/lib/site";
import { city } from "@/lib/contact";

export type ServiceContent = { slug: string; h1: string; kicker: string; intro: string; serviceType: string; looks: [string, string][]; suits: string[]; faq: [string, string][]; other: { href: string; label: string } };

export default function ServicePage({ c }: { c: ServiceContent }) {
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Service", name: c.h1, serviceType: c.serviceType, description: c.intro,
    provider: { "@type": "HealthAndBeautyBusiness", name: SITE.name, url: SITE.url, telephone: SITE.phone }, areaServed: city, url: `${SITE.url}/${c.slug}`,
  };
  return (
    <>
      <main>
        <SiteNav />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="block top">
          <p className="kicker">{c.kicker}</p>
          <h1 className="h1">{c.h1}</h1>
          <p className="lede big">{c.intro}</p>
          <div className="adm-acts"><Link className="btn" href="/#book">Book a session</Link><Link className="btn ghost" href="/reels">See recent work</Link></div>
        </section>
        <section className="block">
          <h2 className="h2">What we offer</h2>
          <div className="pillars">{c.looks.map(([t, p]) => <div key={t} className="glass card"><h3>{t}</h3><p className="lede">{p}</p></div>)}</div>
        </section>
        <section className="block">
          <h2 className="h2">Perfect for</h2>
          <ul className="chips-list">{c.suits.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="lede">We come to you: home, office, events and more. Curious how a session works? <Link href="/about#process">See how a look comes together</Link>.</p>
        </section>
        <section className="block faq">
          <h2 className="h2">Good to know</h2>
          {c.faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </section>
        <section className="block book cta-band">
          <h2 className="h2">Let&apos;s plan yours</h2>
          <p className="lede">Call, WhatsApp or send a message. You can also look at <Link href={c.other.href}>{c.other.label}</Link>.</p>
          <div className="contact"><Link className="btn" href="/contact">Send a message</Link><a className="btn ghost" href={`tel:${SITE.phone}`}>Call us</a></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
