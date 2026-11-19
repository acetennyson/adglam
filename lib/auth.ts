import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash } from "crypto";
import { auth } from "./firebase/admin";

export const ROLES = ["contributor", "editor", "owner"] as const; // low -> high
export type Role = (typeof ROLES)[number];
export const rank = (r: string) => ROLES.indexOf(r as Role);
export const COOKIE = "adg_session";
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export type Session = { uid: string; email: string; name: string; role: Role };

// Verifies the session cookie on every call, including revocation (disabled / signed-out-everywhere accounts fail here).
export const getSession = cache(async (): Promise<Session | null> => {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  try {
    const d = await auth().verifySessionCookie(c, true);
    if (rank(d.role) < 0) return null;
    return { uid: d.uid, email: d.email!, name: (d.name as string) || d.email!, role: d.role };
  } catch { return null; }
});

export async function requireRole(min: Role = "contributor"): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (rank(s.role) < rank(min)) redirect("/admin?denied=1");
  return s;
}
