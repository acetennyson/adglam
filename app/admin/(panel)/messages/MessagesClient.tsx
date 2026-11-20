"use client";
import { useTransition } from "react";
import { deleteMessage, setBooked, setRead } from "./actions";

type Row = { id: string; topic: string; name: string; phone: string; email: string; eventDate: string; message: string; read: boolean; booked: boolean; emailed: boolean | null; at: number };
const wa = (p: string) => { const d = p.replace(/\D/g, ""); return d.length === 9 ? "237" + d : d; }; // 9-digit local Cameroon numbers get 237

export default function MessagesClient({ rows }: { rows: Row[] }) {
  const [pending, start] = useTransition();
  if (!rows.length) return <div className="glass adm-card wide"><p className="lede">No messages yet.</p></div>;
  return (
    <div className="adm-stack" aria-busy={pending}>
      {rows.map((m) => (
        <article key={m.id} className={`glass adm-card wide msg ${m.read ? "" : "new"}`}>
          <div className="adm-row nb"><div><strong>{m.name}</strong> {!m.read && <span className="badge">new</span>} {m.emailed === false && <span className="badge off">email failed</span>} {m.booked && <span className="badge">booked</span>}<br /><small>{m.topic} · {new Date(m.at).toLocaleString()}{m.eventDate && ` · event ${m.eventDate}`}</small></div></div>
          <p className="msg-body">{m.message}</p>
          <div className="adm-acts">
            {m.phone && <><a className="btn sm" href={`tel:${m.phone}`}>Call {m.phone}</a><a className="btn sm ghost" href={`https://wa.me/${wa(m.phone)}`} target="_blank" rel="noreferrer">WhatsApp</a></>}
            {m.email && <a className="btn sm ghost" href={`mailto:${m.email}`}>Email</a>}
            <button className="btn sm ghost" disabled={pending} onClick={() => start(async () => { await setRead(m.id, !m.read); })}>{m.read ? "Mark unread" : "Mark read"}</button>
            <button className="btn sm ghost" disabled={pending} onClick={() => start(async () => { await setBooked(m.id, !m.booked); })}>{m.booked ? "Unmark booked" : "Mark as booked"}</button>
            <button className="btn sm ghost" disabled={pending} onClick={() => confirm(`Delete the message from ${m.name}?`) && start(async () => { await deleteMessage(m.id); })}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
