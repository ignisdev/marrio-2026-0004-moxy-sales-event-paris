# Moxy Hotels - The Art Hunter

Mobile-first QR-led gallery activation scaffold for the Moxy Paris La Villette event on 2 July 2026.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Payload CMS
- PostgreSQL
- AWS S3 media storage
- Vercel deployment

## Local Setup

```bash
npm install
docker compose up -d
npm run dev
```

Open:

- Guest start: http://localhost:3000/en/start
- Guest gallery: http://localhost:3000/en/gallery
- Payload admin: http://localhost:3000/admin

Payload is configured for PostgreSQL via `DATABASE_URI`. The admin route will need a reachable database before creating the first admin user and CMS records.

The local database runs in Docker:

```bash
docker compose up -d
docker compose ps
```

Connection string:

```env
DATABASE_URI="postgresql://postgres:postgres@localhost:5432/moxy_gallery_quest"
```

## Build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` uses `next build --webpack` because the current Payload/Next setup is more stable on webpack than Turbopack for production builds.

## Deployment Recommendation

Build locally first, push the repository to GitHub, then import/connect that repo in Vercel. Configure Vercel environment variables from `.env.example`, using real Payload, PostgreSQL, and AWS S3 secrets only in Vercel/local env files.
