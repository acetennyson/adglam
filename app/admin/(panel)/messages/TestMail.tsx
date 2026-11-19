"use client";
import { useState, useTransition } from "react";
import { sendTestMail } from "./actions";

export default function TestMail({ configured }: { configured: boolean }) {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<{ ok: boolean; error?: string } | null>(null);
  return (
    <div className="glass adm-card wide">
      <strong>Email alerts</strong>
      <small>{configured ? "Email is set up. New messages are also emailed to you." : "Email is not set up yet. Messages are saved here only."}</small>
      <div className="adm-acts"><button className="btn sm ghost" disabled={pending} onClick={() => start(async () => setRes(await sendTestMail()))}>{pending ? "Sending…" : "Send a test email"}</button></div>
      {res && <p className={res.ok ? "" : "adm-err"} role="status">{res.ok ? "Test email sent. Check your inbox (and spam)." : res.error}</p>}
    </div>
  );
}
