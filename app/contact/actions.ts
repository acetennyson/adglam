"use server";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";

type R = { ok: boolean; error?: string };
export const TOPICS = ["Book makeup", "Book photography", "Makeup + photography", "A question", "Collaboration"];
const fail = (error: string): R => ({ ok: false, error });

// 5 messages per hour per visitor (hashed IP, never stored raw).
async function limited() {
  const ip = headers().get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const ref = db().doc(`ratelimits/${createHash("sha256").update(ip + (process.env.IP_SALT || "adglam")).digest("hex")}`);
  return db().runTransaction(async (t) => {
    const d = (await t.get(ref)).data(), now = Date.now();
    if (!d || d.resetAt < now) { t.set(ref, { count: 1, resetAt: now + 3_600_000 }); return false; }
    if (d.count >= 5) return true;
    t.update(ref, { count: d.count + 1 }); return false;
  });
}

// Optional email alert through Resend. Set RESEND_API_KEY and CONTACT_TO_EMAIL to turn it on.
async function notify(m: Record<string, string>) {
  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "ADGlam <onboarding@resend.dev>", to: [to], ...(m.email ? { reply_to: m.email } : {}),
        subject: `New message from ${m.name}: ${m.topic}`,
        text: `${m.topic}\n\nName: ${m.name}\nPhone: ${m.phone || "-"}\nEmail: ${m.email || "-"}\nEvent date: ${m.eventDate || "-"}\n\n${m.message}`,
      }),
    });
  } catch {}
}

export async function sendMessage(i: { topic: string; name: string; phone: string; email: string; eventDate: string; message: string; website: string; elapsed: number }): Promise<R> {
  if (i.website) return { ok: true };                       // honeypot filled: act like it worked, store nothing
  if (i.elapsed < 2500) return fail("That was very quick. Please try again.");
  const name = i.name.trim(), phone = i.phone.trim(), email = i.email.trim().toLowerCase(), message = i.message.trim();
  if (!TOPICS.includes(i.topic)) return fail("Pick what this is about.");
  if (name.length < 2 || name.length > 80) return fail("Enter your name.");
  if (!phone && !email) return fail("Add a phone number or an email so we can reply.");
  if (phone && !/^[+\d][\d\s().-]{5,19}$/.test(phone)) return fail("That phone number does not look right.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail("That email does not look right.");
  if (i.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(i.eventDate)) return fail("Pick a valid date.");
  if (message.length < 10) return fail("Tell us a little more (at least 10 characters).");
  if (message.length > 5000) return fail("Please keep it under 5000 characters.");
  try {
    if (await limited()) return fail("You have sent a few messages already. Please try again later or call us.");
    const doc = { topic: i.topic, name, phone, email, eventDate: i.eventDate, message, read: false, createdAt: Timestamp.now() };
    await db().collection("messages").add(doc);
    await notify({ topic: i.topic, name, phone, email, eventDate: i.eventDate, message });
    return { ok: true };
  } catch { return fail("Could not send right now. Please call us instead."); }
}
