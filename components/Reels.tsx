"use client";
import Link from "next/link";
import { useState } from "react";
import { PLATFORM_LABEL, type Reel } from "@/lib/embed";
import ReelPlayer from "./ReelPlayer";

export default function Reels({ reels }: { reels: Reel[] }) {
  const [open, setOpen] = useState<Reel | null>(null);
  return (
    <section id="reels" className="block">
      <h2 className="h2">Recent work</h2>
      <p className="lede">Looks and shoots from real sessions. Tap a reel to watch.</p>
      <div className="rail">
        {reels.map((r) => (
          <button key={r.id} className="reel" disabled={!r.embedUrl} onClick={() => r.embedUrl && setOpen(r)} aria-label={`Play: ${r.title}`}
            style={{ background: `linear-gradient(160deg, ${r.tone[0]}, ${r.tone[1]})` }}>
            {r.cover && <img src={r.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            {r.platform !== "placeholder" && <span className="glass pill tag">{PLATFORM_LABEL[r.platform]}</span>}
            <span className="glass cap"><strong>{r.title}</strong><span>{r.category}</span></span>
            {r.embedUrl && <i className="play" aria-hidden />}
          </button>
        ))}
      </div>
      <p className="more"><Link className="btn ghost" href="/reels">See all reels</Link></p>
      {open && <ReelPlayer src={open.embedUrl!} title={open.title} href={open.url} label={open.platform === "placeholder" ? "" : PLATFORM_LABEL[open.platform]} onClose={() => setOpen(null)} />}
    </section>
  );
}
