import { requireRole } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import AdminHeader, { type NavItem } from "@/components/admin/AdminHeader";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const me = await requireRole();
  const canInbox = me.role === "owner" || me.role === "editor";
  let unread = 0;
  if (canInbox) { try { unread = (await db().collection("messages").where("read", "==", false).count().get()).data().count; } catch {} }
  const items: NavItem[] = [
    { label: "Dashboard", href: "/admin" },
    { label: "Reels", href: "/admin/reels" },
    ...(canInbox ? [{ label: "Messages", href: "/admin/messages", badge: unread }] : []),
    ...(me.role === "owner" ? [{ label: "Team", href: "/admin/team" }] : []),
    { label: "Blog", soon: true },
    { label: "Contact info", soon: true },
  ];
  return (
    <div className="adm-wrap">
      <AdminHeader items={items} name={me.name} role={me.role} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
