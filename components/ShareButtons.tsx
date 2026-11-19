"use client";
import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="adm-acts">
      <button className="btn sm ghost" onClick={async () => { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 2000); } catch {} }}>{ok ? "Link copied" : "Copy link"}</button>
      <a className="btn sm ghost" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
    </div>
  );
}
