"use client";
import dynamic from "next/dynamic";
import LiquidLogo from "./LiquidLogo";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { city } from "@/lib/contact";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const chapters = [
  { kicker: `Makeup & mobile photography in ${city}`, title: "Remember how you felt.", body: "The morning of a wedding. A birthday shoot. The day the brand finally launched. ADGlam does your makeup and photographs the moment, so you keep the feeling and not just the picture.", keep: "Anytime, anywhere", cta: true },
  { kicker: "7:40 a.m. The car is almost here.", title: "The hour before everything.", body: "This is when nerves turn into excitement. We arrive at your door with the whole kit, and the next hour is yours: calm music, a steady hand and a look chosen around your day.", keep: "Glam, natural or bridal" },
  { kicker: "Soft strokes. Slow breathing.", title: "Skin that feels like you.", body: "Nothing is copied from a template. We start with your skin, your outfit and the way you want to be remembered, then build the look one careful layer at a time.", keep: "Professional products, clean tools" },
  { kicker: "The mirror opens.", title: "The moment you see it.", body: "That small pause when you look up and recognise yourself, only better. It is the part worth slowing down for, so we never rush it.", keep: "Flexible scheduling that works for you" },
  { kicker: "One tap. One flash.", title: "Then we capture it.", body: "The same artist who did your makeup photographs you, on location, in real light. Portraits, events and lifestyle shots, edited to a high standard and ready for your feed or your wall.", keep: "Portraits, events, lifestyle, content" },
  { kicker: "Years from now.", title: "Keep it forever.", body: "A look fades by midnight. A good photograph does not. Book a session in Buea and we will come to you, with the makeup, the camera and the time to make it special.", keep: "Home, office, events and more", cta: true },
];

function Reveal({ text }: { text: string }) {
  const w = text.split(" ");
  return <p className="words">{w.map((x, i) => <span key={i} style={{ ["--i" as any]: i, ["--n" as any]: w.length }}>{x} </span>)}</p>;
}

export default function Story() {
  const { el, progress, chapter, visible } = useScrollProgress(chapters.length);
  const seen = useRef(new Set<number>());
  useEffect(() => {
    if (seen.current.has(chapter)) return; seen.current.add(chapter);
    track("story_chapter", { chapter: chapter + 1, title: chapters[chapter].title });
  }, [chapter]);
  return (
    <div ref={el} className="story" style={{ height: `${chapters.length * 140}vh` }}>
      <div className="stage">
        <div className="canvas"><Scene progress={progress} active={visible} /></div>
        {chapter === 0 && <LiquidLogo className="logo" />}
        <div className="bar" aria-hidden />
        {chapters.map((c, i) => (
          <section key={i} className={`chapter glass ${i === chapter ? "on" : ""} ${i % 2 ? "r" : ""}`} aria-hidden={i !== chapter}>
            <em className="kicker">{c.kicker}</em>
            <h1 className={i === 0 ? "h1" : "h2"}>{c.title}</h1>
            <Reveal text={c.body} />
            <span className="keep">{c.keep}</span>
            {c.cta && <a className="btn" href="#book">Book a session</a>}
          </section>
        ))}
      </div>
    </div>
  );
}
