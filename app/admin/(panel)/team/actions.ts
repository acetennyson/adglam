"use server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase/admin";
import { ROLES, hashToken, requireRole, type Role } from "@/lib/auth";

type R = { ok: boolean; error?: string; link?: string };
const done = (extra: Partial<R> = {}): R => { revalidatePath("/admin/team"); return { ok: true, ...extra }; };
const fail = (error: string): R => ({ ok: false, error });
const log = (actor: string, action: string, target: string, detail?: object) =>
  db().collection("auditLog").add({ actor, action, target, detail: detail ?? null, at: FieldValue.serverTimestamp() });

async function otherOwners(excludeUid: string) {
  const s = await db().collection("admins").where("role", "==", "owner").where("disabled", "==", false).get();
  return s.docs.filter((d) => d.id !== excludeUid).length;
}
async function target(uid: string) { const s = await db().doc(`admins/${uid}`).get(); return s.exists ? s.data()! : null; }

export async function createInvite(email: string, role: Role): Promise<R> {
  const me = await requireRole("owner");
  email = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email.");
  if (!ROLES.includes(role)) return fail("Pick a role.");
  if (!(await db().collection("admins").where("email", "==", email).limit(1).get()).empty) return fail("That person is already an admin.");
  const token = randomBytes(32).toString("base64url");
  await db().doc(`invites/${hashToken(token)}`).set({ email, role, invitedBy: me.uid, used: false, createdAt: Timestamp.now(), expiresAt: Timestamp.fromMillis(Date.now() + 7 * 864e5) });
  await log(me.uid, "invite.create", email, { role });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return done({ link: `${base}/admin/accept?token=${token}` }); // shown once; only the hash is stored
}

export async function revokeInvite(id: string): Promise<R> {
  const me = await requireRole("owner");
  await db().doc(`invites/${id}`).delete(); await log(me.uid, "invite.revoke", id); return done();
}

export async function setRole(uid: string, role: Role): Promise<R> {
  const me = await requireRole("owner");
  if (uid === me.uid) return fail("You cannot change your own role.");
  if (!ROLES.includes(role)) return fail("Invalid role.");
  const t = await target(uid); if (!t) return fail("Admin not found.");
  if (t.role === "owner" && role !== "owner" && (await otherOwners(uid)) < 1) return fail("There must be at least one owner.");
  await auth().setCustomUserClaims(uid, { role });
  await auth().revokeRefreshTokens(uid); // they sign in again to pick up the new role
  await db().doc(`admins/${uid}`).update({ role });
  await log(me.uid, "role.change", uid, { from: t.role, to: role }); return done();
}

export async function setDisabled(uid: string, disabled: boolean): Promise<R> {
  const me = await requireRole("owner");
  if (uid === me.uid) return fail("You cannot disable yourself.");
  const t = await target(uid); if (!t) return fail("Admin not found.");
  if (disabled && t.role === "owner" && (await otherOwners(uid)) < 1) return fail("There must be at least one active owner.");
  await auth().updateUser(uid, { disabled });
  if (disabled) await auth().revokeRefreshTokens(uid);
  await db().doc(`admins/${uid}`).update({ disabled });
  await log(me.uid, disabled ? "admin.disable" : "admin.enable", uid); return done();
}

export async function signOutEverywhere(uid: string): Promise<R> {
  const me = await requireRole("owner");
  await auth().revokeRefreshTokens(uid); await log(me.uid, "admin.signout", uid); return done();
}

export async function removeAdmin(uid: string): Promise<R> {
  const me = await requireRole("owner");
  if (uid === me.uid) return fail("You cannot remove yourself.");
  const t = await target(uid); if (!t) return fail("Admin not found.");
  if (t.role === "owner" && (await otherOwners(uid)) < 1) return fail("There must be at least one owner.");
  await auth().deleteUser(uid); await db().doc(`admins/${uid}`).delete();
  await log(me.uid, "admin.remove", uid, { email: t.email }); return done();
}
