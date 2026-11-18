"use client";
import dynamic from "next/dynamic";
import LiquidLogo from "./LiquidLogo";
import { useScrollProgress } from "@/lib/useScrollProgress";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const chapters = [
  { title: "Makeup that arrives with you.", text: "Glam, natural and bridal looks, done where you are: home, office or the venue.", cta: true },
  { title: "Your look, built around your day.", text: "Every session starts with your event, your skin and your outfit. Nothing is a template." },
  { title: "Prepared down to the brush.", text: "Professional products, clean tools and a flexible schedule, so you are never rushed before you step out." },
  { title: "Then we capture it.", text: "Portraits, events and lifestyle shots on a phone camera, edited to a high standard, from the same artist who did your makeup." },
  { title: "Feel confident. Look amazing.", text: "Book a session in Buea and the team comes to you.", end: true },
];

export default function Story() {
  const { el, progress, chapter } = useScrollProgress(chapters.length);
  return (
    <div ref={el} className="story" style={{ height: `${chapters.length * 110}vh` }}>
      <div className="stage">
        <div className="canvas"><Scene progress={progress} /></div>
        {chapter === 0 && <LiquidLogo className="logo" />}
        {chapters.map((c, i) => (
          <section key={i} className={`chapter glass ${i === chapter ? "on" : ""}`} aria-hidden={i !== chapter}>
            <h1 className={i === 0 ? "h1" : "h2"}>{c.title}</h1>
            <p>{c.text}</p>
            {(c.cta || c.end) && <a className="btn" href="#book">Book a session</a>}
          </section>
        ))}
        <div className="hint" aria-hidden>Scroll</div>
      </div>
    </div>
  );
}
