"use client";
import { useEffect, useRef, useState } from "react";

// Progress (0..1) through a tall container. Besides the ref (read every frame by the 3D scene),
// it writes CSS variables on the container: --p (whole story) and --t (progress inside the
// current chapter) so text can reveal in sync with scroll without re-rendering React.
export function useScrollProgress(chapters: number) {
  const el = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const node = el.current; if (!node) return;
      const r = node.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      progress.current = p;
      const f = p * chapters, c = Math.min(chapters - 1, Math.floor(f));
      node.style.setProperty("--p", p.toFixed(4));
      node.style.setProperty("--t", (f - c).toFixed(4));
      setChapter(c);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [chapters]);
  return { el, progress, chapter };
}
