"use client";
import { useRef, useState, useTransition } from "react";
import { CATEGORIES, PLATFORM_LABEL, embedSrc, parseReelUrl, type Platform } from "@/lib/embed";
import ReelPlayer from "@/components/ReelPlayer";
import { deleteReel, moveReel, saveReel, setStatus } from "./actions";

type Row = { id: string; title: string; category: string; platform: Platform; externalId: string; url: string; cover: string | null; status: "draft" | "published"; by: string; mine: boolean };

// Crop to 9:16 and shrink to ~540x960 JPEG so uploads stay small.
async function toCover(file: File) {
  const bmp = await createImageBitmap(file), c = document.createElement("canvas"); c.width = 540; c.height = 960;
  const s = Math.max(540 / bmp.width, 960 / bmp.height), w = bmp.width * s, h = bmp.height * s;
  c.getContext("2d")!.drawImage(bmp, (540 - w) / 2, (960 - h) / 2, w, h);
  return c.toDataURL("image/jpeg", 0.82);
}

export default function ReelsClient({ reels, role }: { reels: Row[]; role: string }) {
  const editor = role === "editor" || role === "owner";
  const [pending, start] = useTransition();
  const [edit, setEdit] = useState<Row | null>(null);
  const [url, setUrl] = useState(""), [title, setTitle] = useState(""), [cat, setCat] = useState(CATEGORIES[0]);
  const [cover, setCover] = useState<string>(""), [msg, setMsg] = useState(""), [view, setView] = useState<Row | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const detected = url ? parseReelUrl(url) : null;
  const reset = () => { setEdit(null); setUrl(""); setTitle(""); setCat(CATEGORIES[0]); setCover(""); if (fileRef.current) fileRef.current.value = ""; };
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => start(async () => { const r = await fn(); setMsg(r.ok ? "" : r.error || "Something went wrong."); if (r.ok) after?.(); });
  const submit = (publish: boolean) => run(() => saveReel({ id: edit?.id, url, title, category: cat, coverData: cover || undefined, publish }), reset);
  const startEdit = (r: Row) => { setEdit(r); setUrl(r.url); setTitle(r.title); setCat(r.category); setCover(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const canTouch = (r: Row) => editor || (r.status === "draft" && r.mine);

  return (
    <div className="adm-stack" aria-busy={pending}>
      <form className="glass adm-card wide" onSubmit={(e) => { e.preventDefault(); submit(false); }}>
        <h3>{edit ? "Edit reel" : "Add a reel"}</h3>
        <label>Video link<input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@adglam/video/…" required /></label>
        <small>{!url ? "TikTok, Instagram reel or YouTube link." : detected ? `Detected: ${PLATFORM_LABEL[detected.platform]}` : "Not recognised yet. Short TikTok links (vm.tiktok.com) are resolved when you save."}</small>
        <label>Title<input className="field" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Category<select className="field" value={cat} onChange={(e) => setCat(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Cover image (optional, any photo, cropped to 9:16)
          <input ref={fileRef} className="field" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; setCover(f ? await toCover(f) : ""); }} /></label>
        {(cover || edit?.cover) && <img className="adm-thumb" src={cover || edit!.cover!} alt="Cover preview" />}
        {msg && <p className="adm-err" role="alert">{msg}</p>}
        <div className="adm-acts">
          <button className="btn sm" disabled={pending}>{edit ? "Save changes" : "Save as draft"}</button>
          {editor && !(edit?.status === "published") && <button type="button" className="btn sm" disabled={pending} onClick={() => submit(true)}>{edit ? "Save and publish" : "Save and publish now"}</button>}
          {edit && <button type="button" className="btn sm ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <section className="glass adm-card wide">
        <h3>All reels ({reels.length})</h3>
        {reels.length === 0 && <p className="lede">No reels yet. Until you publish one, the website shows placeholder cards.</p>}
        {reels.map((r, i) => (
          <div key={r.id} className="adm-row">
            <div className="adm-reel">
              {r.cover ? <img className="adm-thumb sm" src={r.cover} alt="" referrerPolicy="no-referrer" /> : <span className="adm-thumb sm ph" />}
              <div><strong>{r.title}</strong><br /><small>{PLATFORM_LABEL[r.platform]} · {r.category} · by {r.by || "unknown"}</small></div>
            </div>
            <span className={`badge ${r.status === "draft" ? "off" : ""}`}>{r.status}</span>
            <div className="adm-acts">
              <button className="btn sm ghost" onClick={() => setView(r)}>Preview</button>
              {r.status === "published" && <a className="btn sm ghost" href={`/reels/${r.id}`} target="_blank" rel="noreferrer">View page</a>}
              {canTouch(r) && <button className="btn sm ghost" disabled={pending} onClick={() => startEdit(r)}>Edit</button>}
              {editor && <button className="btn sm ghost" disabled={pending} onClick={() => run(() => setStatus(r.id, r.status === "draft" ? "published" : "draft"))}>{r.status === "draft" ? "Publish" : "Unpublish"}</button>}
              {editor && r.status === "published" && <>
                <button className="btn sm ghost" disabled={pending || i === 0} aria-label="Move earlier" onClick={() => run(() => moveReel(r.id, "up"))}>↑</button>
                <button className="btn sm ghost" disabled={pending} aria-label="Move later" onClick={() => run(() => moveReel(r.id, "down"))}>↓</button></>}
              {canTouch(r) && <button className="btn sm ghost" disabled={pending} onClick={() => confirm(`Delete “${r.title}”?`) && run(() => deleteReel(r.id))}>Delete</button>}
            </div>
          </div>
        ))}
      </section>
      {view && <ReelPlayer src={embedSrc(view.platform, view.externalId)} title={view.title} href={view.url} label={PLATFORM_LABEL[view.platform]} onClose={() => setView(null)} />}
    </div>
  );
}
