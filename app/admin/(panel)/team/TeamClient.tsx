"use client";
import { useState, useTransition } from "react";
import { createInvite, removeAdmin, revokeInvite, setDisabled, setRole, signOutEverywhere } from "./actions";

type A = { uid: string; email: string; name: string; role: string; disabled: boolean; lastLoginAt: number | null };
type I = { id: string; email: string; role: string; expiresAt: number };
const ROLES = ["contributor", "editor", "owner"];

export default function TeamClient({ admins, invites, me }: { admins: A[]; invites: I[]; me: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState(""); const [link, setLink] = useState(""); const [copied, setCopied] = useState(false);
  const run = (fn: () => Promise<{ ok: boolean; error?: string; link?: string }>) => start(async () => {
    const r = await fn(); setMsg(r.ok ? "" : r.error || "Something went wrong."); if (r.link) { setLink(r.link); setCopied(false); }
  });
  return (
    <div className="adm-stack" aria-busy={pending}>
      <form className="glass adm-card inline" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); run(() => createInvite(String(f.get("email")), f.get("role") as any)); e.currentTarget.reset(); }}>
        <h3>Invite an admin</h3>
        <input className="field" name="email" type="email" placeholder="email@example.com" required />
        <select className="field" name="role" defaultValue="contributor">{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
        <button className="btn sm" disabled={pending}>Create invite link</button>
      </form>
      {link && (
        <div className="glass adm-card">
          <p>Send this link to the new admin. It works once, expires in 7 days, and is only shown now.</p>
          <input className="field" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button className="btn sm" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); }}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      )}
      {msg && <p className="adm-err" role="alert">{msg}</p>}

      <section className="glass adm-card">
        <h3>Admins</h3>
        {admins.map((a) => (
          <div key={a.uid} className="adm-row">
            <div><strong>{a.name}</strong>{a.uid === me && " (you)"}<br /><small>{a.email} · {a.lastLoginAt ? `last login ${new Date(a.lastLoginAt).toLocaleDateString()}` : "never signed in"}</small></div>
            <select className="field" value={a.role} disabled={a.uid === me || pending} onChange={(e) => run(() => setRole(a.uid, e.target.value as any))}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            {a.disabled && <span className="badge off">disabled</span>}
            {a.uid !== me && (
              <div className="adm-acts">
                <button className="btn sm ghost" disabled={pending} onClick={() => run(() => setDisabled(a.uid, !a.disabled))}>{a.disabled ? "Enable" : "Disable"}</button>
                <button className="btn sm ghost" disabled={pending} onClick={() => run(() => signOutEverywhere(a.uid))}>Sign out everywhere</button>
                <button className="btn sm ghost" disabled={pending} onClick={() => confirm(`Remove ${a.email}? This deletes their account.`) && run(() => removeAdmin(a.uid))}>Remove</button>
              </div>
            )}
          </div>
        ))}
      </section>

      {invites.length > 0 && (
        <section className="glass adm-card">
          <h3>Pending invites</h3>
          {invites.map((v) => (
            <div key={v.id} className="adm-row">
              <div>{v.email}<br /><small>{v.role} · expires {new Date(v.expiresAt).toLocaleDateString()}</small></div>
              <button className="btn sm ghost" disabled={pending} onClick={() => run(() => revokeInvite(v.id))}>Revoke</button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
