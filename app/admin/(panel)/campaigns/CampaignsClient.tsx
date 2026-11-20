"use client";
import { useState, useTransition } from "react";
import CopyButton from "@/components/CopyButton";
import { MEDIUMS, PATHS, SOURCES } from "@/lib/campaigns";
import { createCampaign, deleteCampaign } from "./actions";

type Item = { id: string; name: string; slug: string; source: string; medium: string; link: string; budget: number | null; notes: string; at: number };
type Res = Record<string, { visitors: number; leads: number; booked: number }> | null;
const money = (n: number) => `${Math.round(n).toLocaleString("en-US")} FCFA`;

export default function CampaignsClient({ items, results, error, configured }: { items: Item[]; results: Res; error: string; configured: boolean }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState(""), [err, setErr] = useState("");
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || ""), form = e.currentTarget;
    start(async () => {
      const r = await createCampaign({ name: g("name"), source: g("source"), medium: g("medium"), path: g("path"), budget: g("budget"), notes: g("notes") });
      if (r.ok) { setLink(r.link || ""); setErr(""); form.reset(); } else { setErr(r.error || "Something went wrong."); setLink(""); }
    });
  }
  return (
    <div className="adm-stack" aria-busy={pending}>
      <form className="glass adm-card wide" onSubmit={submit}>
        <h3>New campaign link</h3>
        <label>Name<input className="field" name="name" required maxLength={60} placeholder="e.g. December bridal glam reel" /></label>
        <div className="cf-grid">
          <label>Where will you share it?<select className="field" name="source">{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>How?<select className="field" name="medium">{MEDIUMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>Send people to<select className="field" name="path">{PATHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>Budget, FCFA (optional)<input className="field" name="budget" inputMode="numeric" placeholder="0" /></label>
        </div>
        <label>Notes (optional)<input className="field" name="notes" maxLength={500} placeholder="Offer, audience, what you posted" /></label>
        {err && <p className="adm-err" role="alert">{err}</p>}
        <div className="adm-acts"><button className="btn sm" disabled={pending}>{pending ? "Creating…" : "Create link"}</button></div>
        {link && <div className="adm-stack"><small>Your tagged link. Paste it in your bio, post or message:</small><input className="field" readOnly value={link} onFocus={(e) => e.target.select()} /><div className="adm-acts"><CopyButton text={link} label="Copy link" /></div></div>}
      </form>

      {!configured && <p className="lede">Results will appear here once PostHog reading is set up (see Insights).</p>}
      {error && <p className="adm-err">Could not load results: {error}</p>}
      <section className="glass adm-card wide">
        <h3>Your campaigns ({items.length})</h3>
        {items.length === 0 && <p className="lede">No campaigns yet. Create your first tagged link above.</p>}
        {items.map((c) => {
          const r = results?.[c.slug];
          return (
            <div key={c.id} className="adm-row camp">
              <div><strong>{c.name}</strong><br /><small>{c.source} · {c.medium} · {new Date(c.at).toLocaleDateString()}{c.budget ? ` · ${money(c.budget)}` : ""}</small>{c.notes && <><br /><small>{c.notes}</small></>}</div>
              <div className="camp-res">{results
                ? <><span><b>{r?.visitors ?? 0}</b> visitors</span><span><b>{r?.leads ?? 0}</b> leads</span><span><b>{r?.booked ?? 0}</b> booked</span>
                    {c.budget && r?.leads ? <span><b>{money(c.budget / r.leads)}</b> per lead</span> : null}
                    {c.budget && r?.booked ? <span><b>{money(c.budget / r.booked)}</b> per booking</span> : null}</>
                : <small>No results yet</small>}</div>
              <div className="adm-acts"><CopyButton text={c.link} label="Copy link" /><button className="btn sm ghost" disabled={pending} onClick={() => confirm(`Delete “${c.name}”? Past visits stay in PostHog.`) && start(async () => { await deleteCampaign(c.id); })}>Delete</button></div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
