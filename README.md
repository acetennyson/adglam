# ADGlam: 3D scroll homepage (Next.js + React Three Fiber)

```
npm install
npm run dev     # http://localhost:3000
```
Deploy: push to GitHub, import in Vercel, no env vars needed yet.

## What is where
- `components/Scene.tsx`: 3D world. Camera flies through lipstick, brush, compact, camera. Objects are procedural (no model files).
- `lib/useScrollProgress.ts` + `components/Story.tsx`: scroll-world pattern. A tall container with a sticky stage; scroll progress drives the camera and chapter text.
- `components/LiquidLogo.tsx`: liquid-metal logo using `@paper-design/shaders-react` (the engine behind liquid-logo). Swap the SVG for your real logo. If the prop names differ in the installed version, check its docs.
- `.glass` in `globals.css`: liquid-glass look via backdrop-filter. The liquid-glass-js library can replace it later for refraction on specific elements.
- `lib/reels.ts`: placeholder reels. `getReels()` is the only function to change when the database is ready.

## Database recommendation for reels + admin
**Supabase** (best fit): Postgres for reel metadata, Storage for images/video, built-in Auth for the admin login, row-level security so only the admin can write. Works from Vercel without connection problems.
- Firebase: also fine (Firestore + Storage + Auth). Pick it if you prefer NoSQL.
- cPanel MySQL: avoid for this. Vercel is serverless, remote MySQL connections are fragile and often blocked, and video does not belong on shared hosting.
- Large videos: add Cloudinary or Mux for compression and streaming.

Suggested `reels` table: id, title, category, kind (video/image), src, poster, tone_a, tone_b, published, sort_order, created_at.

## Admin: team management (Firebase)
Roles: **contributor** drafts, **editor** publishes, **owner** manages the team. Role lives in a Firebase custom claim and is mirrored in Firestore `admins/{uid}`.

Setup
1. Firebase console: create a project, enable **Authentication > Email/Password**, create a **Firestore** database, add a Web app and copy its config.
2. Project settings > Service accounts > Generate new private key. Copy the values into `.env.local` (see `.env.example`). On Vercel add the same variables (paste the private key with `\n` kept as is).
3. Paste `firestore.rules` into Firestore > Rules and publish.
4. Authentication > Settings > Authorized domains: add your Vercel domain.
5. Create the first owner: `node --env-file=.env.local scripts/make-owner.mjs you@email.com "Your Name" "long-password"`.
6. Sign in at `/admin/login`, open **Team**, invite people. The invite link is shown once and expires in 7 days.

## Admin: reels
Paste a TikTok, Instagram or YouTube link in `/admin/reels`. Contributors save drafts; editors publish, unpublish, reorder and delete any reel; owners can do everything.
- Data lives in Firestore `reels/{id}`. The public homepage reads only `published` reels (falls back to placeholder cards until one exists).
- Videos are not uploaded. The site embeds the platform's own player when a visitor taps a card. If a post is deleted on the platform, it stops playing on the site.
- Covers: YouTube covers are automatic. For TikTok/Instagram upload any photo as the cover; it is cropped to 9:16 and stored in Firebase Storage.
- Setup: enable **Storage** in Firebase, set `FIREBASE_STORAGE_BUCKET` in `.env.local` and Vercel, and publish `storage.rules`. Firestore rules are unchanged (reels are read and written only by the server).

### TikTok embed troubleshooting
The site uses the same iframe address TikTok's own oEmbed returns (`/player/v1/ID?embed_from=oembed&...`). If it stops working, set `NEXT_PUBLIC_TIKTOK_EMBED=classic` to switch to the older `/embed/v2/ID` page, and redeploy. Test any video quickly by opening `https://www.tiktok.com/embed/v2/<video id>` in a browser tab.

## Contact page and inbox
`/contact` saves messages to Firestore `messages` (server only). Editors and owners read them in `/admin/messages`, with an unread count in the admin nav.
- Spam protection: hidden honeypot field, minimum time on page, and 5 messages per hour per visitor (hashed IP).
- Email alerts use Nodemailer over SMTP: set `MY_Mail` (where alerts go), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` locally and in Vercel. For Gmail use an App Password (account needs 2-step verification). Owners get a "Send a test email" button in /admin/messages. If email fails the message is still saved and flagged "email failed".
- The WhatsApp button uses `SITE.whatsapp` in `lib/site.ts`. Remove it there and in `app/contact/page.tsx` if the number is not on WhatsApp.
- The homepage reels strip shows `HOME_REELS` (6) reels; change it in `lib/site.ts`.

## Analytics (PostHog) and consent
Full tracking runs only after a visitor clicks Accept on the cookie banner; PostHog is not even loaded before that, and Decline (or "Cookie settings" in the footer) removes it. Data goes through your own domain (`/ingest`) so ad blockers do not hide visitors. The admin browser is never counted.
- Setup: create a free PostHog project, copy its Project API key into `NEXT_PUBLIC_POSTHOG_KEY` and set `NEXT_PUBLIC_POSTHOG_REGION` (`us` or `eu`) locally and in Vercel, then redeploy.
- Events: `$pageview`, `story_chapter`, `reel_open`, `reel_view`, `reel_menu_open`, `reel_share`, `cta_call`, `cta_whatsapp`, `cta_email`, `cta_book`, `cta_contact`, `outbound_tiktok`, `outbound_reel_platform`, `contact_submit`, `contact_error`, and server-side `booking_confirmed` (when you press "Mark as booked" in /admin/messages).
- No names, messages or phone numbers are ever sent to analytics.
- After deploying, confirm in PostHog that visits show a country and city. If they show your hosting location instead, tell me.
- `/privacy` is a plain-language notice matching what the code does. Have it reviewed against your local requirements.

## Admin: Insights and Campaigns
`/admin/insights` (editors and owners) reads your PostHog data back: visitors, sources, places, interest by reel category, contact topics, top reels, visit hours and a 12-month season view. `/admin/campaigns` makes tagged links (UTM) and shows visitors, leads and bookings per campaign, plus cost per lead if you enter a budget.
- Setup: in PostHog create a **personal** API key with only **Query: Read**, then set `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID` (the number in your PostHog URL) in Vercel and redeploy.
- Each panel loads on its own and shows the error if a query fails. Results are cached for about 5 minutes.
