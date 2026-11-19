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
