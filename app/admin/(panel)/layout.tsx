import Link from "next/link";
import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const me = await requireRole();
  return (
    <div className="adm-wrap">
      <header className="adm-top glass">
        <Link href="/admin" className="brand">ADGlam admin</Link>
        <nav className="adm-nav">
          <Link href="/admin">Dashboard</Link>
          {me.role === "owner" && <Link href="/admin/team">Team</Link>}
          <span className="soon">Reels</span><span className="soon">Blog</span><span className="soon">Contact</span>
        </nav>
        <div className="adm-who"><span className="badge">{me.role}</span><span className="adm-name">{me.name}</span><ThemeToggle /><LogoutButton /></div>
      </header>
      <main className="adm-main">{children}</main>
    </div>
  );
}
