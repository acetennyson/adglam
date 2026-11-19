import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import ContactForm from "@/components/ContactForm";
import CopyButton from "@/components/CopyButton";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book makeup or mobile photography in Buea, or ask a question. Send ADGlam a message, call or reach out on TikTok.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const pretty = "+237 670 724 330";
  return (
    <main>
      <SiteNav />
      <section className="block top">
        <p className="kicker">Contact</p>
        <h1 className="h1">Let&apos;s talk</h1>
        <p className="lede">Planning an event, a shoot or just a question? Tell us a little about it and the message lands straight with the team, without leaving this page.</p>
        <div className="ct">
          <aside className="glass cf info">
            <h2 className="h2 sm">Reach us directly</h2>
            <p><strong>Call</strong><br /><a href={`tel:${SITE.phone}`}>{pretty}</a></p>
            <div className="adm-acts"><a className="btn sm" href={`tel:${SITE.phone}`}>Call now</a><a className="btn sm ghost" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a><CopyButton text={pretty} label="Copy number" /></div>
            <p><strong>TikTok</strong><br /><a href={SITE.tiktok} target="_blank" rel="noreferrer">@ADGlam</a></p>
            <p><strong>Based in</strong><br />{SITE.location}<br /><small>We come to you: home, office, events and more.</small></p>
          </aside>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
