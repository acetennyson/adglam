import type { Metadata } from "next";
import ServicePage, { type ServiceContent } from "@/components/ServicePage";
import { SITE } from "@/lib/site";
import { city, elsewhere, reach } from "@/lib/contact";

export const metadata: Metadata = {
  title: `Mobile photographer in ${city}`,
  description: `Portraits, events, lifestyle and creative content photography in ${reach}. ${SITE.name} comes to you and edits every photo to a high standard.`,
  alternates: { canonical: "/photography" },
};
const c: ServiceContent = {
  slug: "photography", kicker: "Mobile photography", h1: `Mobile photographer in ${city}`, serviceType: "Photography",
  intro: `Portraits, events and lifestyle photography that comes to you in ${reach}: relaxed to be in front of, and edited to a high standard.`,
  looks: [["Portraits", "Flattering, natural portraits that feel like you, for birthdays, milestones or your brand."], ["Events", "The moments, the people and the details, captured as they happen."], ["Lifestyle", "Everyday scenes with a polished, story-led feel."], ["Creative content", "Photos made for your feed, your brand and your business."], ["High-quality edits", "Every photo is carefully edited before it reaches you."]],
  suits: ["Birthdays", "Dates and couples", "Personal branding", "Content creators", "Events", "Photo sessions after a glam"],
  faq: [["Do you come to me?", "Yes. We shoot at your home, office, event venue or another location you choose."], ["Can I get makeup and photos together?", "Yes. The same artist can create your look and photograph it. Choose “Makeup + photography” on the contact form."], ["Where are you based?", `We are based in ${city} and also work with clients in ${elsewhere}. Message us with your location to check availability.`], ["How do I book?", "Call, WhatsApp or use the contact form with your date, location and the kind of photos you want."]],
  other: { href: "/makeup", label: "our makeup services" },
};
export default function Page() { return <ServicePage c={c} />; }
