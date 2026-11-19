import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import LogoutButton from "@/components/admin/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const me = await requireRole();
  const canInbox = me.role === "owner" || me.role === "editor";
  let unread = 0;
  if (canInbox) { try { unread = (await db().collection("messages").where("read", "==", false).count().get()).data().count; } catch {} }
  return (
    <div className="adm-wrap">
      <header className="adm-top glass">
        <Link href="/admin" className="brand">ADGlam admin</Link>
        <nav className="adm-nav">
          <Link href="/admin">Dashboard</Link>
          {canInbox && <Link href="/admin/messages">Messages{unread > 0 ? ` (${unread})` : ""}</Link>}
          {me.role === "owner" && <Link href="/admin/team">Team</Link>}
          <Link href="/admin/reels">Reels</Link><span className="soon">Blog</span><span className="soon">Contact</span>
        </nav>
        <div className="adm-who"><span className="badge">{me.role}</span><span className="adm-name">{me.name}</span><ThemeToggle /><LogoutButton /></div>
      </header>
      <main className="adm-main">{children}</main>
    </div>
  );
}
