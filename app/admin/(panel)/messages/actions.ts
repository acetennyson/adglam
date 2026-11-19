"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import { mailConfigured, mailError, mailTo, sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";

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
