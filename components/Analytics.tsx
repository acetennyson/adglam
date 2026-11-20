"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { analyticsEnabled, getConsent, isInternal, setConsent, startAnalytics, stopAnalytics, track, type Consent } from "@/lib/analytics";

// Consent banner + page views + automatic tracking of taps on call / WhatsApp / email / outbound links.
export default function Analytics() {
  const path = usePathname();
  const live = analyticsEnabled && !path.startsWith("/admin");
  const [consent, setC] = useState<Consent>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled || isInternal()) return;
    const c = getConsent(); setC(c); if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("adg:consent-open", reopen);
    return () => window.removeEventListener("adg:consent-open", reopen);
  }, []);
  useEffect(() => { if (consent === "granted") startAnalytics(); else if (consent === "denied") stopAnalytics(); }, [consent]);
  useEffect(() => { if (live && consent === "granted") track("$pageview"); }, [path, consent, live]);
  useEffect(() => {
    if (!live || consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a"); if (!a) return;
      const href = a.getAttribute("href") || "", where = location.pathname;
      if (href.startsWith("tel:")) track("cta_call", { where });
      else if (href.includes("wa.me/?text")) track("reel_share", { method: "whatsapp", where });
      else if (href.includes("wa.me/")) track("cta_whatsapp", { where });
      else if (href.startsWith("mailto:")) track("cta_email", { where });
      else if (href === "/#book") track("cta_book", { where });
      else if (href === "/contact") track("cta_contact", { where });
      else if (/tiktok\.com\/@[\w.]+\/?$/.test(href)) track("outbound_tiktok", { where });
      else if (/\/video\/|instagram\.com|youtube\.com|youtu\.be/.test(href)) track("outbound_reel_platform", { href, where });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [live, consent]);

  if (!live || !open) return null;
  const choose = (v: "granted" | "denied") => { setConsent(v); setC(v); setOpen(false); };
  return (
    <div className="glass cb" role="dialog" aria-label="Cookies and analytics" aria-live="polite">
      <p><strong>Cookies &amp; analytics</strong><br />We would like to use cookies and your approximate location to see which looks and services people enjoy, so we can improve {SITE.name}. Used only for understanding how the site is used. <Link href="/privacy">Privacy notice</Link></p>
      <div className="cb-actions"><button className="btn sm" onClick={() => choose("granted")}>Accept</button><button className="btn sm ghost" onClick={() => choose("denied")}>Decline</button></div>
    </div>
  );
}
