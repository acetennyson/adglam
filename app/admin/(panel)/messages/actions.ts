"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import { mailConfigured, mailError, mailTo, sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";
import { captureServer } from "@/lib/posthog-server";

export async function setRead(id: string, read: boolean) {
  await requireRole("editor");
  await db().doc(`messages/${id}`).update({ read });
  revalidatePath("/admin", "layout"); return { ok: true };
}
export async function deleteMessage(id: string) {
  await requireRole("editor");
  await db().doc(`messages/${id}`).delete();
  revalidatePath("/admin", "layout"); return { ok: true };
}

export async function sendTestMail(): Promise<{ ok: boolean; error?: string }> {
  await requireRole("owner");
  if (!mailConfigured()) return { ok: false, error: "Email is not set up yet. Add SMTP_HOST, SMTP_USER, SMTP_PASS and MY_Mail to the environment variables and redeploy." };
  try {
    await sendMail({ subject: `${SITE.name}: test email`, text: "This is a test email from your website. If you can read it, contact-form alerts are working.", html: "<p style=\"font-family:Arial,sans-serif\">This is a test email from your website. If you can read it, contact-form alerts are working.</p>" });
    return { ok: true };
  } catch (e) { return { ok: false, error: mailError(e) }; }
}

// Marks a message as a confirmed booking. If the visitor had accepted analytics, a "booking_confirmed" event is sent so campaigns can be judged by real bookings.
export async function setBooked(id: string, booked: boolean) {
  await requireRole("editor");
  const ref = db().doc(`messages/${id}`), m = (await ref.get()).data();
  if (!m) return { ok: false };
  await ref.update({ booked, ...(booked ? { read: true } : {}) });
  if (booked && m.ph) await captureServer("booking_confirmed", m.ph, { topic: m.topic, source: "admin_inbox" });
  revalidatePath("/admin", "layout"); return { ok: true };
}
