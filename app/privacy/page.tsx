import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: `How ${SITE.name} handles visitor data, cookies and messages.`, alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <>
      <main>
        <SiteNav />
        <section className="block top prose">
          <h1 className="h1">Privacy notice</h1>
          <p className="lede">A plain-language summary of what this website collects and why.</p>
          <h2>Analytics (only if you accept)</h2>
          <p>If you click Accept on the cookie banner, we use PostHog to measure how the site is used: which pages and reels are viewed, which buttons are tapped (call, WhatsApp, booking), where visitors arrive from (for example TikTok or a campaign link), your device and browser type, and your approximate location (country and city, worked out from your IP address). We use an anonymous identifier stored in your browser. We do not use analytics to identify you personally, and the data is used only to understand and improve the site and our marketing.</p>
          <p>If you click Decline, no analytics code is loaded and nothing is recorded. You can change your choice any time with &quot;Cookie settings&quot; in the footer.</p>
          <h2>Messages you send us</h2>
          <p>When you use the contact form we store your name, the phone number and/or email you give, the event date if any, and your message, so we can reply and arrange your booking. They are emailed to the {SITE.name} team and kept in a private inbox until we delete them. If you accepted analytics, the anonymous identifier above may be saved with your message so we can tell which campaigns lead to bookings.</p>
          <p>The form also checks for spam using a hidden field, timing, and a short-lived record of a scrambled (hashed) version of your IP address; your raw IP address is not stored by us.</p>
          <h2>Who handles the data</h2>
          <p>Analytics data is processed by PostHog on our behalf. Messages are stored with Google Firebase and sent by email. We do not sell your data or use it for advertising.</p>
          <h2>Your choices</h2>
          <p>You can decline analytics, change your mind at any time, or ask us to delete a message you sent. Contact us on <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> or through the <a href="/contact">contact page</a>.</p>
          <p><small>Last updated November 2026.</small></p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
