"use client";
import { useEffect, useRef, useState } from "react";

// Progress (0..1) through a tall container. The ref is read every frame by the 3D scene;
// the state value only changes when the chapter index changes, to keep React renders cheap.
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
      setChapter(Math.min(chapters - 1, Math.floor(p * chapters)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [chapters]);
  return { el, progress, chapter };
}
