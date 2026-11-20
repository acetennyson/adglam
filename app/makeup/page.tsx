import type { Metadata } from "next";
import ServicePage, { type ServiceContent } from "@/components/ServicePage";
import { SITE } from "@/lib/site";
import { city } from "@/lib/contact";

export const metadata: Metadata = {
  title: `Makeup artist in ${city}`,
  description: `Glam, natural and bridal makeup in ${city}. ${SITE.name} comes to you for weddings, birthdays, special occasions and photoshoots.`,
  alternates: { canonical: "/makeup" },
};
const c: ServiceContent = {
  slug: "makeup", kicker: "Makeup", h1: `Makeup artist in ${city}`, serviceType: "Makeup artistry",
  intro: `Glam, natural or bridal: a look built around your skin, your outfit and your occasion, and delivered wherever you are in ${city}.`,
  looks: [["Glam", "Polished, defined and made to be noticed. For nights out, birthdays and the moments you want to be remembered."], ["Natural", "Skin that looks like skin, only fresher and more even. Soft, confident and easy to wear."], ["Bridal", "A look planned for a long, photographed day, shaped to your features and your dress."], ["Special occasions", "Graduations, dates, celebrations and anything that deserves a little magic."], ["Photoshoots", "Makeup planned for the camera and the light, so you look as good in the photos as in the mirror."], ["On location", "We arrive at your home, office or venue with everything needed."]],
  suits: ["Weddings and bridal mornings", "Birthdays", "Dates", "Personal branding", "Content days", "Events", "Photoshoots"],
  faq: [["Do you come to me?", "Yes. We come to your home, office or event venue."], ["Where are you based?", `We are based in ${city}. Send a message to check whether we can reach your location.`], ["Can I book makeup and photography together?", "Yes. Choose “Makeup + photography” on the contact form and tell us about your day."], ["How do I book?", "Call, WhatsApp or use the contact form with your date, location and the look you have in mind."]],
  other: { href: "/photography", label: "our mobile photography" },
};
export default function Page() { return <ServicePage c={c} />; }
