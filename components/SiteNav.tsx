"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";

const ITEMS = [
  { label: "Services", href: "/#services" },
  { label: "Reels", href: "/reels" },
  { label: "Book", href: "/#book" },
  { label: "Contact", href: "/contact" },
];

// Desktop: inline links. Small screens: a burger on the right opens a full-screen menu.
export default function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = (h: string) => (h === "/reels" ? path.startsWith("/reels") : h === "/contact" ? path === "/contact" : false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="nav glass">
        <Link href="/" className="brand">{SITE.name}</Link>
        <nav aria-label="Main">{ITEMS.map((n) => <Link key={n.label} href={n.href} className={active(n.href) ? "on" : ""}>{n.label}</Link>)}</nav>
        <span className="nav-tools"><ThemeToggle /></span>
        <button className="mm-burger" aria-label="Open menu" aria-expanded={open} aria-controls="mm-menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
      </header>

      <div id="mm-menu" className={`mm-menu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open}>
        <div className="mm-top">
          <span className="brand">{SITE.name}</span>
          <button ref={closeBtn} className="mm-burger x" aria-label="Close menu" onClick={() => setOpen(false)}><span /><span /><span /></button>
        </div>
        <nav className="mm-links" aria-label="Site menu">
          {[{ label: "Home", href: "/" }, ...ITEMS].map((n, i) => (
            <Link key={n.label} href={n.href} style={{ ["--i" as any]: i }} className={n.href !== "/" && active(n.href) ? "active" : ""} onClick={() => setOpen(false)}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="glass mm-foot">
          <div className="row"><strong>Makeup &amp; mobile photography</strong></div>
          <small>{SITE.location}. We come to you.</small>
          <div className="row">
            <a className="btn sm" href={`tel:${SITE.phone}`}>Call</a>
            <a className="btn sm ghost" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
