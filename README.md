# Auction Arena

Auction Arena is a modern sports auction platform for league admins, team owners, spectators, and projector/broadcast screens.

## Current Status

- Frontend prototype: Next.js, React, Tailwind CSS.
- Demo hosting: GitHub Pages.
- Production backend foundation: Supabase schema, auth-ready types, storage bucket, realtime tables, and environment template.
- Recommended production hosting: Vercel.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Backend

See `docs/production-backend.md`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill Supabase and Razorpay values before connecting real auth, realtime bidding, uploads, and payments.

## Important Hosting Note

GitHub Pages can host the static demo. Real authentication, Razorpay payments, server-side webhook verification, and realtime production workflows should run on Vercel.

## What Is Now Production-Prepared

- Supabase schema and auth profile trigger are included in `supabase/schema.sql`.
- Razorpay order creation and payment signature verification templates are included in `server/vercel-api/payments`.
- Admin dashboard shows whether Supabase/Razorpay environment variables are configured.
- GitHub Pages remains a browser-trial build. For production, deploy on Vercel and copy the payment templates into `app/api/payments/create-order/route.ts` and `app/api/payments/verify/route.ts`.
