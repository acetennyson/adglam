import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteNav() {
  return (
    <header className="nav glass">
      <Link href="/" className="brand">ADGlam</Link>
      <nav><Link href="/#services">Services</Link><Link href="/reels">Reels</Link><Link href="/#book">Book</Link><Link href="/contact">Contact</Link></nav>
      <ThemeToggle />
    </header>
  );
}
