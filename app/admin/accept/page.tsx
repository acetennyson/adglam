import { db } from "@/lib/firebase/admin";
import { hashToken } from "@/lib/auth";
import AcceptForm from "./AcceptForm";
import { SITE } from "@/lib/site";

export default async function Accept({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";
  const inv = token ? (await db().doc(`invites/${hashToken(token)}`).get()).data() : null;
  const valid = inv && !inv.used && inv.expiresAt.toMillis() > Date.now();
  return (
    <main className="adm-center">
      <div className="glass adm-card">
        <h1 className="h2">Join {SITE.name} admin</h1>
        {valid ? <AcceptForm token={token} email={inv!.email} role={inv!.role} /> : <p className="adm-err">This invite link is invalid, already used or expired. Ask the owner for a new one.</p>}
      </div>
    </main>
  );
}
