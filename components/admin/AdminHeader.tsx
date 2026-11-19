"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "./LogoutButton";
import { SITE } from "@/lib/site";

export type NavItem = { label: string; href?: string; badge?: number; soon?: boolean };

// Desktop: inline nav. Mobile/tablet: a burger on the right opens a full-screen menu.
export default function AdminHeader({ items, name, role }: { items: NavItem[]; name: string; role: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isActive = (h?: string) => !!h && (h === "/admin" ? path === "/admin" : path.startsWith(h));

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
      <header className="adm-top glass">
        <Link href="/admin" className="brand">{SITE.name} admin</Link>
        <nav className="adm-nav" aria-label="Admin">
          {items.map((n) => n.href
            ? <Link key={n.label} href={n.href} className={isActive(n.href) ? "active" : ""}>{n.label}{n.badge ? ` (${n.badge})` : ""}</Link>
            : <span key={n.label} className="soon">{n.label}</span>)}
        </nav>
        <div className="adm-who"><span className="badge">{role}</span><span className="adm-name">{name}</span><ThemeToggle /><LogoutButton /></div>
        <button className="mm-burger" aria-label="Open menu" aria-expanded={open} aria-controls="mm-menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
      </header>

      <div id="mm-menu" className={`mm-menu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Admin menu" aria-hidden={!open}>
        <div className="mm-top">
          <span className="brand">{SITE.name} admin</span>
          <button ref={closeBtn} className="mm-burger x" aria-label="Close menu" onClick={() => setOpen(false)}><span /><span /><span /></button>
        </div>
        <nav className="mm-links" aria-label="Admin menu">
          {items.map((n, i) => {
            const style = { ["--i" as any]: i };
            const inner = <><span className="n">{String(i + 1).padStart(2, "0")}</span>{n.label}{n.badge ? <span className="badge cnt">{n.badge}</span> : null}{n.soon || !n.href ? <small>soon</small> : null}</>;
            return n.href
              ? <Link key={n.label} href={n.href} style={style} className={isActive(n.href) ? "active" : ""} onClick={() => setOpen(false)}>{inner}</Link>
              : <span key={n.label} style={style} className="soon">{inner}</span>;
          })}
        </nav>
        <div className="glass mm-foot">
          <div className="row"><strong>{name}</strong><span className="badge">{role}</span></div>
          <div className="row"><ThemeToggle /><LogoutButton /></div>
        </div>
      </div>
    </>
  );
}
