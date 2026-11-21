# ADGlam

Website for **ADGlam**, a makeup and mobile photography brand in Buea, Cameroon, with a 3D scroll-story homepage, a reels feed, contact form, SEO pages and a private admin.

Built with Next.js 14 (App Router), React Three Fiber, Firebase, Nodemailer and PostHog. Deployed on Vercel.

## Contents
1. [Features](#features) · 2. [Quick start](#quick-start) · 3. [Brand settings](#brand-settings) · 4. [Environment variables](#environment-variables) · 5. [Firebase setup](#firebase-setup) · 6. [Deploy to Vercel](#deploy-to-vercel) · 7. [Admin guide](#admin-guide) · 8. [Reels and embeds](#reels-and-embeds) · 9. [Contact and email](#contact-and-email) · 10. [Analytics and consent](#analytics-and-consent) · 11. [SEO](#seo) · 12. [Performance](#performance) · 13. [Data model](#data-model) · 14. [Project structure](#project-structure) · 15. [Troubleshooting](#troubleshooting) · 16. [Roadmap](#roadmap)

## Features
**Public site**
- `/` 3D scroll story (camera flies through lipstick, brush, compact, camera and polaroids), services, recent reels, founder teaser, booking.
- `/reels` gallery with category filters. `/reels/[id]` TikTok-style vertical feed: big video, caption over it, action rail, tap to pause, hold for more options.
- `/about` founder story and the ADGlam process. `/makeup` and `/photography` local SEO landing pages.
- `/contact` multi-step form that saves to Firestore and emails the owner. `/privacy` plain-language notice.
- Light theme (blush and rose) and a pinked dark theme. Full-screen mobile menu. Cookie consent banner.

**Admin** (`/admin`, never indexed)
- Team management with roles, reels management (paste TikTok, Instagram or YouTube links), message inbox, Insights dashboard, Campaigns with tagged links.

## Quick start
Requires Node 20 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production check
```
The public site runs without Firebase (reels show placeholder cards). The admin, contact form storage, reels and inbox need Firebase.

## Brand settings
Everything about the brand lives in **`lib/site.ts`**. Edit it and the whole site follows (nav, footer, contact page, metadata, search data, share image, manifest, emails).

| Export | Holds |
|---|---|
| `SITE` | name, url, title, description, phone, whatsapp (digits only), location (`"City, Country"`), tiktok URL |
| `FOUNDER` | name, role, photo. Add her photo to `/public` (for example `/enow-adian.jpg`) and set `photo` to that path |
| `CREDIT` | developer credit shown in the footer |
| `AREAS` | other towns or regions she works in, besides the home city. Feeds the page copy and the search-engine service-area data |
| `PROOF` | optional social proof (Google rating and review count, follower counts, highlights). Shown only for the fields you fill in, so use real, checkable numbers |
| `HOME_REELS` | how many reels the homepage strip shows |

`lib/contact.ts` derives display values from those (formatted phone, `@handle` from the TikTok link, city and country from the location). Do not hard-code contact details elsewhere.

## Environment variables
Copy `.env.example` to `.env.local` locally. On Vercel add the same names under **Settings, Environment Variables**. Variables starting with `NEXT_PUBLIC_` are baked in at build time, so **redeploy after changing them**.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | Your real address, e.g. `https://adglam.com`. Used for sitemap, share previews, canonical links, invite links |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID` | admin login | From Firebase web app config |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | admin, data | Service account. **Secret.** Keep `\n` in the private key as written |
| `FIREBASE_STORAGE_BUCKET` | reel covers | e.g. `your-project.firebasestorage.app` |
| `MY_Mail` | email alerts | Where new-message alerts go |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | email alerts | Gmail: `smtp.gmail.com`, port `587`, secure `false`, an App Password |
| `IP_SALT` | contact form | Any random string, used to hash visitor IPs for rate limiting |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_REGION` | analytics | Project API key (starts `phc_`), region `us` or `eu`. Empty key turns analytics and the banner off |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID` | Insights, Campaigns | **Personal** API key with only **Query: Read**. Project ID is the number in your PostHog URL |
| `NEXT_PUBLIC_TIKTOK_EMBED` | reels | Empty = Embed Player. `classic` = older `/embed/v2` page |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `YANDEX_SITE_VERIFICATION`, `PINTEREST_SITE_VERIFICATION` | SEO | The `content="..."` value of each verification tag only |

`.env` files are git-ignored. Never commit real secrets.

## Firebase setup
1. Create a project at the Firebase console.
2. **Authentication**: enable **Email/Password**. Under Settings, Authorized domains, add your Vercel and custom domains.
3. **Firestore**: create a database, then paste `firestore.rules` into Rules and publish.
4. **Storage**: enable it, then paste `storage.rules` and publish.
5. **Web app**: Project settings, General, add a Web app, copy its config into the `NEXT_PUBLIC_FIREBASE_*` variables.
6. **Service account**: Project settings, Service accounts, Generate new private key. Put the three values into the `FIREBASE_*` variables.
7. **First owner** (run once, locally):
   ```bash
   node --env-file=.env.local scripts/make-owner.mjs you@email.com "Your Name" "a-long-password"
   ```
8. Sign in at `/admin/login`. Invite everyone else from **Team**.

All reads and writes of team, reel, message and campaign data happen on the server, so the rules deny direct client access.

## Deploy to Vercel
1. Push the repo to GitHub and import it in Vercel.
2. Add the environment variables above.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your final domain and redeploy once the domain is connected.
4. Run the first-owner script (step 7 above) if you have not already.

## Admin guide
Roles (set in a Firebase custom claim, mirrored in Firestore):

| Role | Can do |
|---|---|
| **contributor** | Add reels as drafts; edit and delete their own drafts; preview anything |
| **editor** | Everything a contributor can, plus publish and unpublish, edit or delete any reel, reorder, read the inbox, use Insights and Campaigns |
| **owner** | Everything, plus manage the team and send the test email |

- **Team** (`/admin/team`, owner): invite by email and role. The invite link is shown once, works once and expires in 7 days; send it yourself. Change roles, disable, sign out everywhere, remove. The last active owner cannot be demoted, disabled or removed.
- **Reels** (`/admin/reels`): paste a TikTok, Instagram or YouTube link, add a title, category and optional cover (cropped to 9:16 and stored in Firebase Storage).
- **Messages** (`/admin/messages`, editor): enquiries from the contact page with one-tap Call, WhatsApp and Email. Mark read, **Mark as booked** (this feeds analytics), delete. Owners get a **Send a test email** button.
- **Insights** (`/admin/insights`, editor): visitors, sources, places, interest by reel category, contact topics, top reels, visit hours, 12-month season view, plus plain-English takeaways. Needs the PostHog personal key.
- **Campaigns** (`/admin/campaigns`, editor): create tagged (UTM) links per post or promotion and see visitors, leads, bookings and cost per lead for each.

Browsers that open the admin are marked as internal and are never counted in analytics.

## Reels and embeds
Videos are not uploaded. The site embeds each platform's own player. If a post is deleted on the platform, it stops playing here. Short TikTok links (`vm.tiktok.com`) are resolved when you save.
- YouTube covers are automatic; for TikTok and Instagram upload a cover.
- Embedded players can be blocked by strict browsers or tracking protection. Every reel has a **Watch on TikTok/Instagram/YouTube** link as a fallback.
- Feed controls: swipe or scroll, ↑ ↓ or J K keys, tap to pause or play, hold about half a second for share and more. Instagram embeds have no tap or hold layer.

## Contact and email
`/contact` validates the form, stores the message in Firestore, then emails the owner through Nodemailer (SMTP). If email fails, the message is still saved and flagged **email failed** in the inbox.
- Spam protection: hidden honeypot field, minimum time on page, and 5 messages per hour per visitor (hashed IP).
- Gmail needs an **App Password** (the account must have 2-step verification). Use port `587` with `SMTP_SECURE=false`.
- Use the owner-only **Send a test email** button in the inbox to check your settings.

## Analytics and consent
PostHog loads **only after a visitor clicks Accept**. Decline, or "Cookie settings" in the footer, removes it. Data goes through `/ingest` on your own domain so ad blockers do not hide visitors. Autocapture and session replay are off. No names, messages or phone numbers are ever sent.

Events: `$pageview`, `story_chapter`, `reel_open`, `reel_view`, `reel_menu_open`, `reel_share`, `cta_call`, `cta_whatsapp`, `cta_email`, `cta_book`, `cta_contact`, `outbound_tiktok`, `outbound_reel_platform`, `contact_submit`, `contact_error`, and server-side `booking_confirmed` (when you press **Mark as booked** for a visitor who accepted analytics).

Two different PostHog keys:
- **Project API key** (`phc_...`, public, in `NEXT_PUBLIC_POSTHOG_KEY`): sends events.
- **Personal API key** (private, `POSTHOG_PERSONAL_API_KEY`, only **Query: Read**): lets the admin read numbers back. Not the "project secret API keys" page.

After deploying, accept the banner in an incognito window and confirm events (with a country and city) appear in PostHog. `/privacy` describes what the code does; have it reviewed against your local requirements.

## SEO
- Unique title, description and canonical on every public page; `sitemap.xml` and `robots.txt` generated (admin, `/api/` and `/ingest/` are excluded).
- Structured data: business and founder (site-wide), `AboutPage` + `Person` (`/about`), `Service` (`/makeup`, `/photography`), `VideoObject` on reels that have a cover and publish date.
- Share image and icons generated; web manifest included.
- Google result appearance: the home page declares a **site name** (`WebSite` data, with a favicon of 48px or more) and inner pages declare **breadcrumbs**, which Google may show instead of the bare domain. Google decides what it displays; markup only makes the page eligible.
- **Stars and review counts** do not come from markup on your own site: Google ignores review markup that a business puts on its own pages for itself. Stars come from reviews on your **Google Business Profile**. So the site shows real testimonials and the `PROOF` strip as normal content, with no review markup. Never add fake or undisclosed incentivised reviews (Google's rules, updated July 2026).
- Follower counts cannot be forced into search results. They appear on the site through `PROOF`.
- Not tied to one town: `AREAS` in `lib/site.ts` drives the copy and the `areaServed` data. Only add places that are genuinely served.
- Search-engine verification tags are added from the four `*_SITE_VERIFICATION` variables. After adding them in Vercel and redeploying, press Verify in Google Search Console, Bing Webmaster Tools, Yandex Webmaster and Pinterest, and submit `/sitemap.xml`.
- Off-site matters most: a Google Business Profile (service-area business), the same name, phone and location everywhere, "Enow Adian M" and "ADGlam" named consistently on every profile with a link to the site, client reviews with permission, and mentions from local collaborators.

## Performance
The 3D story adapts to the device (full, balanced or light) using a device guess plus live frame-rate monitoring, remembers the level that worked, and stops drawing when scrolled out of view.
- Force a level for testing with `?quality=low`, `?quality=medium` or `?quality=high` on the homepage.
- Starting guess and thresholds live in `components/Scene.tsx` (`TIERS`, `initialTier`).

## Data model
Firestore collections (server access only):

| Collection | Holds |
|---|---|
| `admins/{uid}` | email, name, role, disabled, invitedBy, createdAt, lastLoginAt |
| `invites/{hash}` | email, role, invitedBy, used, createdAt, expiresAt (only a hash of the link is stored) |
| `auditLog/*` | actor, action, target, detail, at |
| `reels/{id}` | platform, externalId, url, title, category, cover, status, sortOrder, createdBy, createdAt, publishedAt |
| `messages/{id}` | topic, name, phone, email, eventDate, message, read, booked, emailed, ph, createdAt |
| `campaigns/{id}` | name, slug, source, medium, path, link, budget, notes, createdAt |
| `ratelimits/{hash}` | count, resetAt |

## Project structure
```
app/                 pages and routes (public pages, /admin, /api/session, sitemap, robots, manifest, icons)
  admin/(panel)/     team, reels, messages, insights, campaigns
components/          UI (Scene, Story, ReelFeed, SiteNav, SiteFooter, Analytics, ContactForm, ...)
  admin/             admin header and menu
lib/                 site.ts (brand settings), auth, firebase, mailer, analytics, posthog, embed, reels, campaigns
scripts/             make-owner.mjs (first owner)
firestore.rules  storage.rules
```

## Troubleshooting
- **Admin pages redirect to login forever**: check the `FIREBASE_*` variables and that your domain is in Authentication, Authorized domains.
- **No analytics banner**: `NEXT_PUBLIC_POSTHOG_KEY` is missing or you have not redeployed; or this browser has opened the admin (marked internal) or already chose. Try incognito.
- **PostHog shows no events**: region mismatch is the usual cause (an EU key with `NEXT_PUBLIC_POSTHOG_REGION=us`, or the reverse).
- **Insights shows an error in a panel**: it prints PostHog's message. Check the personal key has only Query: Read and the project ID is right.
- **Emails not arriving**: use the test button. Gmail needs an App Password; port `587` needs `SMTP_SECURE=false`; check `MY_Mail` is a full address and check spam.
- **TikTok reel says "Unable to load player"** (403 from TikTok): often browser tracking protection or the visitor's network. Use the Watch link, try another browser, or set `NEXT_PUBLIC_TIKTOK_EMBED=classic`.
- **Homepage 3D feels slow**: add `?quality=low` to compare; the site normally adapts by itself.
- **Styles clash after adding CSS**: feed classes are prefixed `rf-`, menu classes `mm-`; keep new class names specific.

## Roadmap
Testimonials section (managed from the admin), blog management, contact-info management from the admin, and the learning foundation (nightly analytics sync, recommendation log, then models for intent labelling, forecasting and recommendations once there is enough data).
