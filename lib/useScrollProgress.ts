"use client";
import { useEffect, useRef, useState } from "react";

// Progress (0..1) through a tall container. Besides the ref (read every frame by the 3D scene),
// it writes CSS variables on the container: --p (whole story) and --t (progress inside the current chapter).
// Work is throttled to one pass per animation frame, and `visible` tells the scene when to stop rendering.
export function useScrollProgress(chapters: number) {
  const el = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const node = el.current; if (!node) return;
      const r = node.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      progress.current = p;
      const f = p * chapters, c = Math.min(chapters - 1, Math.floor(f));
      node.style.setProperty("--p", p.toFixed(4));
      node.style.setProperty("--t", (f - c).toFixed(4));
      setChapter(c);
      setVisible(r.bottom > -200 && r.top < vh + 200);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [chapters]);
  return { el, progress, chapter, visible };
}
