export const SOURCES = [["tiktok", "TikTok"], ["instagram", "Instagram"], ["whatsapp", "WhatsApp"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["flyer", "Flyer / QR code"], ["other", "Other"]] as const;
export const MEDIUMS = [["social", "Social post"], ["bio", "Profile link"], ["story", "Story"], ["ad", "Paid ad"], ["qr", "QR code"], ["message", "Direct message"]] as const;
export const PATHS = [["/", "Home page"], ["/reels", "Reels"], ["/contact", "Contact page"]] as const;
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 40);
