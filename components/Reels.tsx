import type { Reel } from "@/lib/reels";

export default function Reels({ reels }: { reels: Reel[] }) {
  return (
    <section id="reels" className="block">
      <h2 className="h2">Recent work</h2>
      <p className="lede">Looks and shoots from real sessions. Tap a reel to watch.</p>
      <div className="rail">
        {reels.map((r) => (
          <article key={r.id} className="reel" style={{ background: `linear-gradient(160deg, ${r.tone[0]}, ${r.tone[1]})` }}>
            {r.kind === "video" && r.src && <video src={r.src} poster={r.poster} muted loop playsInline preload="none" />}
            {r.kind === "image" && r.src && <img src={r.src} alt={r.title} loading="lazy" />}
            <div className="glass cap"><strong>{r.title}</strong><span>{r.category}</span></div>
            {r.kind === "video" && <i className="play" aria-hidden />}
          </article>
        ))}
      </div>
    </section>
  );
}
