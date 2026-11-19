"use client";
import { useEffect } from "react";

export default function ReelPlayer({ src, title, href, label, onClose }: { src: string; title: string; href?: string; label?: string; onClose: () => void }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    window.addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="player-bg" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="glass player" onClick={(e) => e.stopPropagation()}>
        <button className="glass pill x" onClick={onClose} autoFocus>Close</button>
        <iframe src={src} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" />
        {href && <a className="player-link" href={href} target="_blank" rel="noreferrer">Not loading? Watch on {label || "the original site"} ↗</a>}
      </div>
    </div>
  );
}
