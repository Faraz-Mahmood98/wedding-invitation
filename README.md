# Wedding Invites

A multi-tenant, mobile-first, bilingual (English / اردو) wedding invitation
platform. One codebase serves many weddings — each with its own content, theme,
events, guests and RSVPs — reachable at a personal link.

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
  Prisma 6 (PostgreSQL) · Framer Motion · Zod · Vitest
- **Runs without a database** via a bundled demo fixture (`INVITATION_DEMO=true`).

---

## Features

- Personalised invitation per guest with an animated opening gate, hero,
  families, personal message, live countdown, events, RSVP and FAQs.
- Bilingual EN/UR with RTL text (never a mirrored layout) and per-guest default
  language.
- Per-wedding theming (palette colours + fonts) applied through CSS variables.
- Romantic art direction: a flush opening gate with a monogram medallion,
  hand-drawn floral motifs (arch, corners, dividers, ring) and a per-wedding
  opening background (four presets or any custom image URL).
- Music toggle, petal/scroll reveal animations, scratch-to-reveal countdown;
  respects `prefers-reduced-motion`.
- Per-event RSVP with seat caps, dietary notes and a message; validates and
  rate-limits on the server.
- Per-wedding admin: RSVP dashboard, CSV export, guest management (add / edit /
  delete, per-event seats, CSV import, copy link, WhatsApp), events, families,
  FAQs and settings — behind a signed httpOnly session cookie.
- Wildcard-subdomain tenancy with a path-based fallback for local dev.

---

## Prerequisites

- **Node.js 22+** (Vitest 5 requires `@types/node` ^22 / Node ≥ 20.11)
- npm (or pnpm / yarn / bun)
- A PostgreSQL database — **optional** to try the app (see demo mode)

---

## Quick start (demo mode, no database)

The repo ships with `INVITATION_DEMO="true"` in `.env`, so it renders from static
fixtures and everything is explorable immediately.

```bash
npm install
npm run dev
```

Open http://localhost:3000

> Demo mode serves fixtures only. Admin edits and RSVPs are validated but **not
> persisted**; a yellow banner in the admin reminds you. Switch to a real
> database to save (see below).

---

## Using the app

### Guest invitations

| What | URL |
| --- | --- |
| Demo wedding home | http://localhost:3000/w/ahmad-mawra |
| Personal invitation | http://localhost:3000/w/ahmad-mawra/sara-hassan |
| Component preview | http://localhost:3000/preview |

Demo guests for the `ahmad-mawra` wedding:

| Slug | Guest | Type | Default language |
| --- | --- | --- | --- |
| `imran-ali` | Imran Ali | single | English |
| `sara-hassan` | Sara & Hassan | couple | اردو |
| `khan-family` | The Khan Family | family | English |
| `ayesha-noor` | Ayesha Noor | single | اردو |
| `bilal-fatima` | Dr. Bilal & Fatima | couple | English |

- Append `?lang=ur` or `?lang=en` to override the language. Without it, the
  guest's own default is used.
- Opening the bare wedding URL without a guest slug shows a neutral "this link
  needs your personal code" prompt.

### RSVP

On any invitation, choose **Yes / No / Maybe** per event, select seats (capped by
the guest's allowance), optionally add dietary notes and a message, then press
**Send RSVP**. In demo mode the success state is shown but nothing is saved;
`/w/ahmad-mawra/sara-hassan` already shows a pre-filled Mehendi RSVP from the
fixture. With a real database the response is stored and pre-filled on return.

### Admin dashboard

1. Go to http://localhost:3000/admin — you'll be redirected to `/admin/login`.
2. Sign in with one of the seeded accounts:

   | Email | Password | Role |
   | --- | --- | --- |
   | `ahmad.mawra@example.com` | `changeme123` | wedding admin |
   | `super@example.com` | `changeme123` | super admin |

3. You land on **Overview**, with navigation for:

   - **Guests** — add / edit / delete, per-event seat assignment, CSV import,
     copy personalised link, send via WhatsApp.
   - **Events** — full CRUD with EN/UR fields.
   - **Families** — groom/bride sides with EN/UR member names.
   - **FAQs** — ordered question/answer pairs.
    - **Settings** — couple names, default language, timezone, Bismillah toggle,
      personal message, the opening background (preset gallery, custom URL or
      upload), the background-music track and the six theme colours.

   **Export CSV** on the Overview downloads every guest with their per-event
   RSVP status and confirmed seats.

   Poster (Events) and figure (Families) images and the opening background and
   music can be uploaded directly from the form — files up to 8 MB (images) and
   15 MB (audio). Uploads are stored on the local filesystem in development
   (`storage/uploads`, streamed back through `/uploads/...`) or in Vercel Blob
   when the storage env vars are set.

### Super admin

Signing in as a super admin lands on **/super** instead of the wedding
dashboard:

| What | URL |
| --- | --- |
| Wedding list + totals | http://localhost:3000/super |
| Create a wedding | http://localhost:3000/super/new |
| Wedding detail | http://localhost:3000/super/{weddingId} |

From here a super admin can create a wedding (names, URL slug, admin email and
password), rename it, reset its admin password, or delete it. Creating a
wedding seeds both the `Wedding.adminEmail`/`passwordHash` fields and the
matching `AdminUser` row so the new admin can sign in immediately. In demo mode
these mutations are validated but not persisted (same banner as the dashboard).

### Subdomain routing (production model)

In production a wedding is reached at `{slug}.example.com/{guestSlug}`. The
middleware rewrites that to the internal `/w/{slug}/{guestSlug}` route. Locally,
`{slug}.localhost` usually resolves automatically, so
http://ahmad-mawra.localhost:3000/sara-hassan works too. Reserved subdomains
(`www`, `app`, `admin`, `super`, `api`, `assets`, `static`) are never treated as
tenants.

---

## Connecting a real database

1. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string.
2. Set `INVITATION_DEMO="false"`.
3. Create the schema and load seed data:

   ```bash
   npm run db:migrate   # prisma migrate dev (creates + applies a migration)
   npm run db:seed      # loads "Ahmad & Mawra", 5 guests, events, FAQs, admins
   ```

   (`npm run db:push` is an alternative that syncs the schema without a
   migration; `npm run db:studio` opens Prisma Studio.)

Admin edits and guest RSVPs now persist, and the invitation gains real RSVP
pre-filling and open-tracking.

Seed data summary: wedding slug `ahmad-mawra` ("Ahmad & Mawra"), events
**Mehendi** (2026-12-04 19:00), **Baraat** (2026-12-05 19:30), **Walima**
(2026-12-06 20:00) in `Asia/Karachi`, plus 5 guests, 5 FAQs and the two admin
accounts above.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply a migration (`prisma migrate dev`) |
| `npm run db:push` | Push the schema without a migration |
| `npm run db:seed` | Seed the database (`tsx prisma/seed.ts`) |
| `npm run db:studio` | Open Prisma Studio |

`postinstall` runs `prisma generate` automatically.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | ≥ 16 chars; signs the admin session cookie |
| `APP_ROOT_DOMAIN` | No | Root domain without scheme, e.g. `mydomain.com` (default `localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL used to build guest links (default `http://localhost:3000`) |
| `INVITATION_DEMO` | No | `"true"` serves fixtures without a database |
| `RSVP_RATE_LIMIT_PER_MINUTE` | No | RSVP/login rate limit per IP (default `10`) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token — enables Blob uploads when paired with the base URL |
| `STORAGE_PUBLIC_BASE_URL` | No | Public base URL for stored Blob uploads |

Copy `.env.example` to `.env` and fill in the values.

---

## Project structure

```
prisma/
  schema.prisma          # Wedding, AdminUser, Event, Family, Faq, Guest, GuestEvent, Rsvp
  seed.ts                # Demo wedding + guests + admins
prisma.config.ts         # Prisma config (loads .env)
src/
  middleware.ts          # Wildcard-subdomain → /w/{slug}/{guest} rewrite
  app/
    page.tsx             # Landing / theme tokens demo
    preview/             # Standalone invitation preview
    w/[weddingSlug]/[guestSlug]/  # Personalised invitation (path + subdomain)
    uploads/[...path]/   # Serves locally-stored uploads (dev/filesystem backend)
    admin/               # Login + guarded dashboard (overview, guests, events, families, faqs, settings)
    super/               # Super-admin login + dashboard (weddings, new, detail)
    api/                 # rsvp, auth/login, auth/logout, admin/export, admin/upload
  components/
    admin/               # UploadField (image/audio) and other dashboard controls
    invitation/          # Invitation sections, animations, music, scratch reveal
  lib/
    data/                # Invitation + admin + super data access (with demo fallback)
    fixtures/            # Static demo invitation
    i18n/                # EN/UR dictionaries
    auth.ts              # bcrypt + signed session cookie helpers
    storage.ts           # Upload validation + local/Blob storage backends
    upload-client.ts     # Browser helper that posts to /api/admin/upload
    validation.ts        # Zod schemas (RSVP, admin/super forms, CSV parsing)
    images.ts            # Opening-background presets + default
    monogram.ts          # Couple-name → initials for the medallion
    theme.ts, rsvp.ts, rate-limit.ts, time.ts, env.ts ...
```

### How it fits together

- **Data access** (`src/lib/data`) sits behind `loadInvitation`, which uses
  Prisma in production and falls back to the fixture on `INVITATION_DEMO=true`
  or a database connection error. Cross-tenant lookups never fall back.
- **Isolation** is enforced in the mapper (`map.ts`): a guest only ever sees
  events they hold a `GuestEvent` for.
- **Auth** uses HMAC-signed httpOnly cookies (Node `crypto`); the dashboard
  layout calls `requireWeddingAdmin()` and the super dashboard calls
  `requireSuperAdmin()`, redirecting unauthenticated visitors to the matching
  login.
- **Server actions** (`src/app/admin/actions.ts`, `src/app/super/actions.ts`)
  handle all admin/super mutations and are scoped to the signed-in wedding or
  restricted to super admins.

---

## Testing

```bash
npm test
```

Covers the pure logic: tenant-isolation mapping, theme normalisation, i18n
helpers, session signing/verification, the rate limiter, seat clamping, upload
validation/storage, and the Zod schemas + CSV parser.

---

## Deployment notes

- Set `APP_ROOT_DOMAIN` and `NEXT_PUBLIC_APP_URL` to your domains and configure
  a wildcard DNS record (`*.yourdomain.com`) plus a wildcard TLS certificate.
- Set `AUTH_SECRET` to a long random value; the cookie is marked `Secure`
  automatically when `NEXT_PUBLIC_APP_URL` starts with `https://`.
- `next.config.ts` already sends `X-Robots-Tag: noindex` and a strict
  `Referrer-Policy` for invitations.
- For durable uploads on serverless hosts, set `BLOB_READ_WRITE_TOKEN` and
  `STORAGE_PUBLIC_BASE_URL` so media goes to Vercel Blob. Without them, uploads
  are written to `storage/uploads` on the local filesystem, which is suitable
  only for a persistent, long-running server.

---

## Roadmap

- [x] Phase 1 — scaffold, schema, theming, i18n
- [x] Phase 2 — invitation sections + preview
- [x] Phase 3 — animations, music, scratch reveal
- [x] Phase 4 — tenancy routing + data layer
- [x] Phase 5 — RSVP + per-wedding admin
- [x] Phase 6 — super admin + image/audio uploads
- [ ] Phase 7 — OG images, SEO, calendar (.ics)
- [ ] Phase 8 — deployment + docs
