"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { acceptInvite } from "./actions";

export default function AcceptForm({ token, email, role }: { token: string; email: string; role: string }) {
  const router = useRouter(); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget), password = String(f.get("password"));
    const r = await acceptInvite(token, String(f.get("name")), password);
    if (!r.ok) { setErr(r.error || "Failed."); setBusy(false); return; }
    try {
      const cred = await signInWithEmailAndPassword(clientAuth, email, password);
      await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await cred.user.getIdToken() }) });
      await signOut(clientAuth); router.replace("/admin"); router.refresh();
    } catch { router.replace("/admin/login"); }
  }
  return (
    <form onSubmit={submit} className="adm-stack">
      <p className="lede">You were invited as <strong>{role}</strong> with <strong>{email}</strong>.</p>
      <label>Your name<input className="field" name="name" required autoComplete="name" /></label>
      <label>Choose a password<input className="field" name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
      {err && <p className="adm-err" role="alert">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create my account"}</button>
    </form>
  );
}
