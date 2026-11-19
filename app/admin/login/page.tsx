"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    try {
      const cred = await signInWithEmailAndPassword(clientAuth, String(f.get("email")), String(f.get("password")));
      const res = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await cred.user.getIdToken() }) });
      await signOut(clientAuth);
      if (!res.ok) throw new Error();
      router.replace("/admin"); router.refresh();
    } catch { setErr("Email or password is wrong, or this account has no access."); setBusy(false); }
  }
  return (
    <main className="adm-center">
      <form className="glass adm-card" onSubmit={submit}>
        <h1 className="h2">ADGlam admin</h1>
        <label>Email<input className="field" name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input className="field" name="password" type="password" autoComplete="current-password" required /></label>
        {err && <p className="adm-err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
