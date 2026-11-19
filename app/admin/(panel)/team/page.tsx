import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import TeamClient from "./TeamClient";

export default async function Team() {
  const me = await requireRole("owner");
  const [a, i] = await Promise.all([db().collection("admins").orderBy("createdAt").get(), db().collection("invites").where("used", "==", false).get()]);
  const admins = a.docs.map((d) => { const x = d.data(); return { uid: d.id, email: x.email, name: x.name, role: x.role, disabled: !!x.disabled, lastLoginAt: x.lastLoginAt?.toMillis?.() ?? null }; });
  const invites = i.docs.map((d) => ({ id: d.id, email: d.data().email, role: d.data().role, expiresAt: d.data().expiresAt.toMillis() })).filter((v) => v.expiresAt > Date.now());
  return (<><h1 className="h2">Team</h1><p className="lede">Contributors draft, editors publish, owners manage the team.</p><TeamClient admins={admins} invites={invites} me={me.uid} /></>);
}
