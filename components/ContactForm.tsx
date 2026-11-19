"use client";
import { useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/contact/actions";

const TOPICS = ["Book makeup", "Book photography", "Makeup + photography", "A question", "Collaboration"];

export default function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]), [msg, setMsg] = useState(""), [err, setErr] = useState(""), [done, setDone] = useState("");
  const [pending, start] = useTransition();
  const t0 = useRef(Date.now());
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || "");
    start(async () => {
      const r = await sendMessage({ topic, name: g("name"), phone: g("phone"), email: g("email"), eventDate: g("eventDate"), message: msg, website: g("website"), elapsed: Date.now() - t0.current });
      if (r.ok) setDone(g("name").split(" ")[0]); else setErr(r.error || "Something went wrong.");
    });
  }
  if (done) return (
    <div className="glass cf" role="status">
      <h2 className="h2">Thank you, {done}.</h2>
      <p className="lede">Your message has been received. We will get back to you using the contact details you left.</p>
    </div>
  );
  return (
    <form className="glass cf" onSubmit={submit}>
      <div className="cf-step"><span className="cf-num">01</span><div><strong>What is this about?</strong>
        <div className="chips" role="group" aria-label="Topic">{TOPICS.map((t) => <button key={t} type="button" aria-pressed={t === topic} className={`glass pill chip ${t === topic ? "on" : ""}`} onClick={() => setTopic(t)}>{t}</button>)}</div></div></div>
      <div className="cf-step"><span className="cf-num">02</span><label>Your name<input className="field" name="name" autoComplete="name" required maxLength={80} /></label></div>
      <div className="cf-step"><span className="cf-num">03</span><div className="cf-grid">
        <label>Phone or WhatsApp<input className="field" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="6XX XXX XXX" /></label>
        <label>Email (optional if you add a phone)<input className="field" name="email" type="email" autoComplete="email" /></label></div></div>
      <div className="cf-step"><span className="cf-num">04</span><div className="cf-grid one">
        <label>Event date, if you have one<input className="field" name="eventDate" type="date" /></label>
        <label>Tell us about it<textarea className="field" value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={10} maxLength={5000} rows={6} placeholder="The occasion, where you are, the look you have in mind…" />
          <small className="count">{msg.length}/5000</small></label></div></div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {err && <p className="adm-err" role="alert">{err}</p>}
      <div className="cf-send"><button className="btn" disabled={pending}>{pending ? "Sending…" : "Send message"}</button><small>Goes straight to the ADGlam team.</small></div>
    </form>
  );
}
