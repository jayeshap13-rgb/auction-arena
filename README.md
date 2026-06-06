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
