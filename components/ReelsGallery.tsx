"use client";
import Link from "next/link";
import { useState } from "react";
import { PLATFORM_LABEL, type Reel } from "@/lib/embed";

export default function ReelsGallery({ reels, chips = true }: { reels: Reel[]; chips?: boolean }) {
  const cats = ["All", ...Array.from(new Set(reels.map((r) => r.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? reels : reels.filter((r) => r.category === cat);
  return (
    <>
      {chips && cats.length > 2 && (
        <div className="chips" role="group" aria-label="Filter by category">
          {cats.map((c) => <button key={c} aria-pressed={c === cat} className={`glass pill chip ${c === cat ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      )}
      <div className="reel-grid">
        {list.map((r) => {
          const style = { background: `linear-gradient(160deg, ${r.tone[0]}, ${r.tone[1]})` };
          const inner = (<>
            {r.cover && <img src={r.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            {r.platform !== "placeholder" && <span className="glass pill tag">{PLATFORM_LABEL[r.platform]}</span>}
            <span className="glass cap"><strong>{r.title}</strong><span>{r.category}</span></span>
            {r.embedUrl && <i className="play" aria-hidden />}
          </>);
          return r.embedUrl
            ? <Link key={r.id} href={`/reels/${r.id}`} className="reel" style={style} aria-label={`Open reel: ${r.title}`}>{inner}</Link>
            : <div key={r.id} className="reel" style={style}>{inner}</div>;
        })}
      </div>
    </>
  );
}
