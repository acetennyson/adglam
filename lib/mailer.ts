import "server-only";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { SITE } from "./site";

const env = (k: string) => (process.env[k] || "").trim();
export const mailTo = () => env("MY_Mail") || env("MY_MAIL");
export const mailConfigured = () => !!(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS") && mailTo());

let tx: Transporter | null = null;
function transport() {
  if (tx) return tx;
  const port = Number(env("SMTP_PORT") || 587);
  // Port 465 = implicit TLS. Port 587 = STARTTLS, where secure must be false (the connection upgrades itself).
  const secure = port === 465 ? true : port === 587 ? false : env("SMTP_SECURE") === "true";
  tx = nodemailer.createTransport({
    host: env("SMTP_HOST"), port, secure, requireTLS: !secure,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS").replace(/\s+/g, "") }, // Gmail app passwords are shown with spaces
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000,
  });
  return tx;
}

export async function sendMail(o: { subject: string; text: string; html: string; replyTo?: string }) {
  await transport().sendMail({ from: env("MAIL_FROM") || `${SITE.name} <${env("SMTP_USER")}>`, to: mailTo(), replyTo: o.replyTo, subject: o.subject, text: o.text, html: o.html });
}

export function mailError(e: any): string {
  if (e?.code === "EAUTH") return "The mail server rejected the login. For Gmail use an App Password (it needs 2-step verification) and the full address as SMTP_USER.";
  if (["ECONNECTION", "ESOCKET", "ETIMEDOUT", "EDNS"].includes(e?.code)) return "Could not reach the mail server. Check SMTP_HOST and SMTP_PORT.";
  return e?.message ? String(e.message).slice(0, 200) : "Sending failed.";
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const wa = (p: string) => { const d = p.replace(/\D/g, ""); return d.length === 9 ? "237" + d : d; };

export function messageEmail(m: { topic: string; name: string; phone: string; email: string; eventDate: string; message: string }) {
  const inbox = `${SITE.url}/admin/messages`;
  const subject = `New message from ${m.name}: ${m.topic}`;
  const text = `${m.topic}\n\nName: ${m.name}\nPhone: ${m.phone || "-"}\nEmail: ${m.email || "-"}\nEvent date: ${m.eventDate || "-"}\n\n${m.message}\n\nInbox: ${inbox}`;
  const row = (k: string, v: string) => (v ? `<tr><td style="padding:2px 14px 2px 0;color:#6b4f55">${k}</td><td>${v}</td></tr>` : "");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;background:#fbefea;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f0d4d0">
<div style="background:linear-gradient(135deg,#f2b8b0,#a85d6b);padding:18px 24px;color:#fff"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase">New message</div><div style="font-size:20px;font-weight:700;margin-top:2px">${esc(m.topic)}</div></div>
<div style="padding:22px 24px;color:#1b1114;font-size:15px;line-height:1.6">
<p style="margin:0 0 10px"><strong style="font-size:17px">${esc(m.name)}</strong></p>
<table style="border-collapse:collapse;font-size:14px;margin-bottom:14px">
${row("Phone", m.phone ? `<a href="tel:${esc(m.phone)}" style="color:#a85d6b">${esc(m.phone)}</a> &middot; <a href="https://wa.me/${wa(m.phone)}" style="color:#a85d6b">WhatsApp</a>` : "")}
${row("Email", m.email ? `<a href="mailto:${esc(m.email)}" style="color:#a85d6b">${esc(m.email)}</a>` : "")}
${row("Event date", esc(m.eventDate))}
</table>
<div style="white-space:pre-wrap;background:#fbefea;border-radius:12px;padding:14px 16px">${esc(m.message)}</div>
<p style="margin:20px 0 0"><a href="${inbox}" style="display:inline-block;background:#a85d6b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Open inbox</a></p>
</div></div></div>`;
  return { subject, text, html, replyTo: m.email || undefined };
}
