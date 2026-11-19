"use server";
import { Timestamp } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase/admin";
import { hashToken } from "@/lib/auth";

export async function acceptInvite(token: string, name: string, password: string): Promise<{ ok: boolean; email?: string; error?: string }> {
  if (!name.trim()) return { ok: false, error: "Enter your name." };
  if (password.length < 10) return { ok: false, error: "Use at least 10 characters." };
  const ref = db().doc(`invites/${hashToken(token)}`), inv = (await ref.get()).data();
  if (!inv || inv.used || inv.expiresAt.toMillis() < Date.now()) return { ok: false, error: "This invite is invalid or has expired." };
  try {
    const u = await auth().createUser({ email: inv.email, password, displayName: name.trim(), emailVerified: true });
    await auth().setCustomUserClaims(u.uid, { role: inv.role });
    await db().doc(`admins/${u.uid}`).set({ email: inv.email, name: name.trim(), role: inv.role, disabled: false, invitedBy: inv.invitedBy, createdAt: Timestamp.now() });
    await ref.update({ used: true, usedAt: Timestamp.now() });
    await db().collection("auditLog").add({ actor: u.uid, action: "invite.accept", target: inv.email, detail: { role: inv.role }, at: Timestamp.now() });
    return { ok: true, email: inv.email };
  } catch (e: any) {
    return { ok: false, error: e?.code === "auth/email-already-exists" ? "An account with this email already exists." : "Could not create the account." };
  }
}
