"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PLATFORM_LABEL, embedSrc, type Platform, type Reel } from "@/lib/embed";
import { SITE } from "@/lib/site";
import { city, tiktokHandle } from "@/lib/contact";
import { track } from "@/lib/analytics";

const PATHS: Record<string, string[]> = {
  share: ["M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7", "M16 6l-4-4-4 4", "M12 2v13"],
  book: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"],
  out: ["M14 3h7v7", "M10 14L21 3", "M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5"],
  on: ["M11 5L6 9H2v6h4l5 4V5z", "M15.5 8.5a5 5 0 010 7", "M19 5a10 10 0 010 14"],
  off: ["M11 5L6 9H2v6h4l5 4V5z", "M23 9l-6 6", "M17 9l6 6"],
  play: ["M7 4l13 8-13 8z"],
};
const Icon = ({ n }: { n: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill={n === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {PATHS[n].map((d, i) => <path key={i} d={d} />)}
  </svg>
);

// Control the platform's player through its documented postMessage API.
function send(frame: HTMLIFrameElement | null, p: Platform, cmd: "play" | "pause") {
  const w = frame?.contentWindow; if (!w) return;
  if (p === "tiktok") w.postMessage({ type: cmd, value: undefined, "x-tiktok-player": true }, "*");
  else if (p === "youtube") w.postMessage(JSON.stringify({ event: "command", func: cmd === "play" ? "playVideo" : "pauseVideo", args: [] }), "*");
}

// TikTok-style vertical feed. Big video, caption over it, actions on the right, hold the video for more.
export default function ReelFeed({ reels, startId, siteUrl }: { reels: Reel[]; startId: string; siteUrl: string }) {
  const start = Math.max(0, reels.findIndex((r) => r.id === startId));
  const box = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const player = useRef<HTMLIFrameElement | null>(null);
  const press = useRef({ t: 0, x: 0, y: 0, moved: false, long: false });
  const [active, setActive] = useState(start);
  const [playing, setPlaying] = useState(start);
  const [muted, setMuted] = useState(true);   // starts silent so autoplay is allowed; unmuting reloads the player with sound
  const [paused, setPaused] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [hint, setHint] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { slides.current[start]?.scrollIntoView({ block: "start" }); }, [start]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))), { root: box.current, threshold: 0.6 });
    slides.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reels.length]);
  useEffect(() => {
    setPlaying(-1); setPaused(false); setSheet(false);
    const t = setTimeout(() => setPlaying(active), 300);
    const r = reels[active];
    if (r) { history.replaceState(null, "", `/reels/${r.id}`); document.title = `${r.title} | ${SITE.name}`; }
    return () => clearTimeout(t);
  }, [active, reels]);
  useEffect(() => { const t = setTimeout(() => setHint(false), 8000); return () => clearTimeout(t); }, []);

  const go = useCallback((d: number) => {
    const n = Math.min(reels.length - 1, Math.max(0, active + d));
    slides.current[n]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active, reels.length]);
  const openSheet = () => { track("reel_menu_open", { reel_id: reels[active].id }); send(player.current, reels[active].platform as Platform, "pause"); setSheet(true); setHint(false); };
  const closeSheet = () => { setSheet(false); if (!paused) send(player.current, reels[active].platform as Platform, "play"); };
  const toggle = () => { const p = reels[active].platform as Platform; send(player.current, p, paused ? "play" : "pause"); setPaused(!paused); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sheet) return closeSheet();
      if (sheet) return;
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); go(-1); }
      else if (e.key === " " && reels[active].platform !== "instagram") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  // Hold the video (about half a second) to open the options sheet. A tap pauses/plays. A swipe scrolls to the next reel.
  const down = (e: React.PointerEvent) => {
    clearTimeout(press.current.t);
    press.current = { x: e.clientX, y: e.clientY, moved: false, long: false, t: window.setTimeout(() => { press.current.long = true; navigator.vibrate?.(12); openSheet(); }, 500) };
  };
  const move = (e: React.PointerEvent) => {
    if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 10) { press.current.moved = true; clearTimeout(press.current.t); }
  };
  const up = () => { clearTimeout(press.current.t); if (!press.current.long && !press.current.moved) toggle(); };
  const cancel = () => clearTimeout(press.current.t);

  useEffect(() => {
    if (playing < 0) return;
    const r = reels[playing];
    if (r) track("reel_view", { reel_id: r.id, title: r.title, category: r.category, platform: r.platform, position: playing + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const cur = reels[active], curUrl = `${siteUrl}/reels/${cur.id}`;
  return (
    <>
      <div ref={box} className="feed" aria-label="Reels feed">
        {reels.map((r, i) => {
          const p = r.platform as Platform, ctl = p !== "instagram", live = i === playing;
          const tags = [r.category, SITE.name, city].map((t) => "#" + t.toLowerCase().replace(/\s+/g, ""));
          return (
            <section key={r.id} data-i={i} ref={(el) => { slides.current[i] = el; }} className="rf-slide" aria-label={`Reel ${i + 1} of ${reels.length}: ${r.title}`}>
              <div className="rf-stage">
                <div className="rf-frame" style={{ background: `linear-gradient(160deg, ${r.tone[0]}, ${r.tone[1]})` }}>
                  {live
                    ? <iframe ref={(el) => { if (i === active) player.current = el; }} src={embedSrc(p, r.externalId!, true, muted, ctl)} title={r.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" />
                    : <>{r.cover && <img src={r.cover} alt="" referrerPolicy="no-referrer" />}<i className="play" aria-hidden /></>}
                  {live && ctl && <div className="rf-layer" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onPointerLeave={cancel} onContextMenu={(e) => e.preventDefault()} />}
                  {live && paused && <div className="rf-paused" aria-hidden><Icon n="play" /></div>}
                  <div className="rf-cap">
                    <strong className="who">{tiktokHandle()}</strong>
                    <span className="ttl">{r.title}</span>
                    <span className="tags">{tags.join(" ")}</span>
                    {hint && i === active && ctl && <span className="hint">Hold the video for more</span>}
                  </div>
                </div>
                <div className="rf-rail">
                  {ctl && <button className="rf-btn" onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}><span className="ic"><Icon n={muted ? "off" : "on"} /></span>{muted ? "Sound" : "Mute"}</button>}
                  <button className="rf-btn" onClick={openSheet} aria-label="Share and more"><span className="ic"><Icon n="share" /></span>Share</button>
                  <Link className="rf-btn" href="/#book" aria-label="Book a similar look"><span className="ic"><Icon n="book" /></span>Book</Link>
                  <a className="rf-btn" href={r.url} target="_blank" rel="noreferrer" aria-label={`Watch on ${PLATFORM_LABEL[p]}`}><span className="ic"><Icon n="out" /></span>{PLATFORM_LABEL[p]}</a>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div className="feed-nav">
        <button className="glass pill" aria-label="Previous reel" disabled={active === 0} onClick={() => go(-1)}>↑</button>
        <small>{active + 1} / {reels.length}</small>
        <button className="glass pill" aria-label="Next reel" disabled={active === reels.length - 1} onClick={() => go(1)}>↓</button>
      </div>
      {sheet && (
        <div className="sheet-bg" onClick={closeSheet} role="dialog" aria-modal="true" aria-label="Reel options">
          <div className="glass sheet" onClick={(e) => e.stopPropagation()}>
            <strong>{cur.title}</strong>
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(`${cur.title} ${curUrl}`)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
            <button className="btn ghost" onClick={async () => { try { await navigator.clipboard.writeText(curUrl); track("reel_share", { method: "copy", reel_id: cur.id }); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }}>{copied ? "Link copied" : "Copy link"}</button>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && <button className="btn ghost" onClick={() => navigator.share({ title: cur.title, url: curUrl }).catch(() => {})}>Share…</button>}
            <a className="btn ghost" href={cur.url} target="_blank" rel="noreferrer">Watch on {PLATFORM_LABEL[cur.platform as Platform]} ↗</a>
            <Link className="btn ghost" href="/#book">Book a similar look</Link>
            <button className="btn ghost" onClick={closeSheet}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
