import Link from "next/link";
import { CREDIT, SITE } from "@/lib/site";
import { city, phonePretty, tiktokHandle } from "@/lib/contact";
import { analyticsEnabled } from "@/lib/analytics";
import CookieSettings from "./CookieSettings";

export default function SiteFooter() {
  return (
    <footer className="sf">
      <div className="sf-in">
        <div>
          <Link href="/" className="brand">{SITE.name}</Link>
          <p className="lede">Makeup and mobile photography that comes to you in {city}. Look beautiful, capture moments.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            <li><Link href="/#services">Services</Link></li>
            <li><Link href="/reels">Reels</Link></li>
            <li><Link href="/#book">Book a session</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3>Get in touch</h3>
          <ul>
            <li><a href={`tel:${SITE.phone}`}>{phonePretty()}</a></li>
            <li><a href={SITE.tiktok} target="_blank" rel="noreferrer">TikTok {tiktokHandle()}</a></li>
            <li>{SITE.location}</li>
          </ul>
        </div>
      </div>
      <div className="sf-base">
        <span>© {new Date().getFullYear()} {SITE.name}. <Link href="/privacy">Privacy</Link>{analyticsEnabled && <> · <CookieSettings /></>}</span>
        <span className="sf-credit">Website by <a href={CREDIT.url} target="_blank" rel="noopener">{CREDIT.name}↗</a></span>
      </div>
    </footer>
  );
}
