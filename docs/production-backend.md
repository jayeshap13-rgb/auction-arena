# Auction Arena Production Backend

Auction Arena currently runs as a frontend prototype on GitHub Pages. That is fine for demo viewing, but real admins, owners, bidding, payments, approvals, and live projector sync need a backend. The recommended production path is Supabase plus Vercel.

## 1. Create Supabase Project

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm these tables exist: `profiles`, `leagues`, `teams`, `players`, `bids`, `owner_requests`, `payments`, and `audit_logs`.
5. Confirm the public storage bucket `auction-arena-media` exists.

## 2. Configure Environment

Copy `.env.example` to `.env.local` for local development and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use the same values in Vercel project environment variables. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` in client components.

## 3. Auth And Roles

Supabase Auth should own real login. The app needs these roles:

- `admin`: creates and manages only leagues they created.
- `owner`: requests entry to leagues and bids only after admin approval and payment.
- `viewer`: public read-only access for spectator and projector links.

The database schema already includes row-level security for those ownership rules.

## 4. Pricing Rules

Auction Arena pricing rules for production:

- Admin-managed league: first 3 teams are free, then Rs. 99 per extra team before auction start.
- Owner bidding league: Rs. 499 per approved owner login.
- One demo league can be used for trial testing, with limited teams and no production payment bypass.

Razorpay order creation and webhook verification must run from Vercel API routes, not GitHub Pages.

## 5. Realtime Channels

The schema publishes these tables to Supabase Realtime:

- `leagues`
- `teams`
- `players`
- `bids`
- `owner_requests`
- `payments`

Live auction room, owner bidding, spectator mode, and projector mode should subscribe to the selected league ID and refresh instantly when bids, timer state, current player, sold status, or owner approval changes.

## 6. Deployment

Use GitHub Pages only for the static demo. Use Vercel for production because real payments and webhooks need server routes.

Recommended flow:

1. Connect the GitHub repo to Vercel.
2. Add all environment variables.
3. Keep GitHub Pages as a demo URL if desired.
4. Use the Vercel URL as the production app URL.
5. Add the Vercel URL to Supabase Auth redirect URLs and Razorpay webhook settings.

## 7. Next Implementation Steps

1. Replace localStorage sessions with Supabase Auth.
2. Replace `lib/auctionStore.ts` persistence with Supabase queries and realtime subscriptions.
3. Add Vercel API routes for Razorpay order creation and webhook verification.
4. Add PDF and Excel report export from central database data.
5. Add validation so admins cannot start auctions with missing teams, purse, players, or base prices.
6. Add audit log writes for bids, undo bids, sold, unsold, timer changes, approvals, and payments.
