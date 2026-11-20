export const CREDIT = { name: "Ado Daniel NJ", url: "https://adodanielnj.vercel.app/" };

export const SITE = {
  name: "ADGlam",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://adglam.vercel.app", // set NEXT_PUBLIC_SITE_URL in Vercel once you have the domain
  title: "ADGlam | Makeup & mobile photography in Buea",
  description: "Makeup and mobile photography that comes to you in Buea, Cameroon. Glam, natural and bridal looks, portraits, events and content, at home, the office or on location.",
  phone: "+237670724330",
  whatsapp: "237670724330", // digits only, no +
  location: "Buea, Cameroon",
  tiktok: "https://www.tiktok.com/@a_dglam",
};

// How many reels the homepage "Recent work" strip shows (the rest live on /reels).
export const HOME_REELS = 6;

// The face of the brand. Add her photo to /public (for example "/enow-adian.jpg") and put the path in `photo`.
export const FOUNDER = {
  name: "Enow Adian M",
  role: "Founder, makeup artist and photographer",
  photo: "",
};
