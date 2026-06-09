# ServerClips

TikTok-style video discovery for Metin2 / MMORPG private servers. Players scroll short promo videos; creators upload content; servers are brand profiles with their own team dashboard.

**Not a forum.** Video-first, simple, fast.

## Product structure

| Experience | Route | Who |
|------------|-------|-----|
| Video feed | `/` | Everyone (guests included) |
| Search | `/search` | Everyone |
| User profile | `/u/[username]` | Everyone |
| Server profile | `/server/[slug]` | Everyone |
| Creator Studio | `/studio` | Creators |
| Server Dashboard | `/server-dashboard` | Server team members |
| Admin moderation | `/admin` | Moderators & admins |

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Neon Postgres + Prisma ORM
- Auth.js (credentials)
- S3-compatible object storage for media (URLs only in DB)
- Tailwind + Metin2-themed UI

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL (pooled), DIRECT_URL (direct), AUTH_SECRET
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000 — guests can watch immediately without logging in.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon **pooled** URL (app runtime) |
| `DIRECT_URL` | Yes | Neon **direct** URL (Prisma CLI) |
| `AUTH_SECRET` | Yes | Auth.js secret |
| `NEXTAUTH_URL` | Yes | App URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL for SEO |
| `S3_*` | Prod | Object storage for video/image uploads |

## Demo accounts

Password for all: `password123`

| Role | Email | Username |
|------|-------|----------|
| Admin | admin@serverclips.dev | admin |
| Moderator | moderator@serverclips.dev | modteam |
| Creator | creator@serverclips.dev | metin2promo |
| Creator | dragonclips@serverclips.dev | dragonclips |
| Creator | pvmmaster@serverclips.dev | pvmmaster |
| User | user@serverclips.dev | playerone |

## Roles & permissions

- **Guest** — watch, search, filter, visit server links, open profiles
- **User** — like, save, comment, follow creators/servers, personalized feed
- **Creator** — upload/manage videos via `/studio`
- **Server OWNER** — full server dashboard, team, verification
- **Server ADMIN** — edit profile, manage linked videos
- **Server PROMOTER** — upload/link videos to server
- **Server ANALYST** — view server analytics only
- **Moderator** — approve videos/servers, moderate comments/reports
- **Admin** — user roles, audit logs, full platform access

## Key features

- Vertical short-video feed with autoplay
- Guest-friendly (login modal only for like/save/follow/comment)
- Recommendation scoring (behavior-based, no ML)
- Creator Studio with per-video analytics
- Server brand profiles separate from user accounts
- Server verification badge
- Admin moderation with audit logs
- Event tracking: views, clicks, searches, engagement

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed sample data |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma migrate dev` | Create/apply migrations (dev) |
| `npx tsx scripts/check-neon.ts` | Test DB connection |

## Media storage

Postgres stores **URLs only**. Production requires S3-compatible storage (`S3_BUCKET`, etc.). Local dev falls back to `public/uploads/`.

## Database

Uses Prisma migrations (`prisma/migrations/`). Neon setup:

```bash
npx neonctl@latest init   # optional — MCP/skills setup
```

Pooled URL for the app, direct URL for migrations.
