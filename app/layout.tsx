import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";
import { city, country } from "@/lib/contact";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", style: ["normal", "italic"] });
const body = Montserrat({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [`makeup artist ${city}`, `mobile photography ${city}`, "bridal makeup Cameroon", "glam makeup", "event photography", SITE.name],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: SITE.name, title: SITE.title, description: SITE.description, locale: "en_CM" },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbefea" }, { media: "(prefers-color-scheme: dark)", color: "#1a0f13" }],
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  address: { "@type": "PostalAddress", addressLocality: city, addressCountry: country },
  areaServed: city,
  sameAs: [SITE.tiktok],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Makeup: glam, natural and bridal" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile photography: portraits, events, lifestyle, content" } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("adg-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
