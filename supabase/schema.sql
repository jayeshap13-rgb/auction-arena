-- Auction Arena production schema for Supabase.
-- Run this in Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'owner', 'viewer');
create type public.league_mode as enum ('admin', 'owner');
create type public.league_status as enum ('Draft', 'Open', 'Live', 'Paused', 'Completed');
create type public.lot_status as enum ('Queued', 'Under Auction', 'Sold', 'Unsold');
create type public.approval_status as enum ('Pending', 'Approved', 'Rejected');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_purpose as enum ('admin_extra_team', 'owner_login');
create type public.payment_provider as enum ('razorpay', 'manual');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'owner',
  name text not null,
  email text not null unique,
  status text not null default 'Active' check (status in ('Active', 'Disabled')),
  created_at timestamptz not null default now()
);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'owner'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Auction User'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger create_profile_after_auth_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  sport text not null,
  management_mode public.league_mode not null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  status public.league_status not null default 'Draft',
  purse numeric not null default 1000,
  bid_increment numeric not null default 10,
  max_teams integer not null default 8,
  max_players_per_team integer not null default 16,
  current_player_id uuid null,
  timer_seconds integer not null default 24,
  sponsor text,
  round integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  owner_name text not null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  logo_url text,
  color text not null default '#E50914',
  purse numeric not null default 1000,
  spent numeric not null default 0,
  squad integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  role text not null,
  category text not null,
  base_price numeric not null,
  rating text,
  stats text,
  photo_url text,
  status public.lot_status not null default 'Queued',
  sold_to_team_id uuid references public.teams(id) on delete set null,
  sold_price numeric,
  approval_status public.approval_status not null default 'Approved',
  created_at timestamptz not null default now()
);

alter table public.leagues
  add constraint leagues_current_player_fk
  foreign key (current_player_id) references public.players(id) on delete set null;

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  amount numeric not null,
  placed_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);

create table public.owner_requests (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.approval_status not null default 'Pending',
  payment_status public.payment_status not null default 'pending',
  payment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, team_id, owner_user_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  owner_request_id uuid references public.owner_requests(id) on delete set null,
  amount numeric not null,
  currency text not null default 'INR' check (currency = 'INR'),
  purpose public.payment_purpose not null,
  provider public.payment_provider not null default 'razorpay',
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.owner_requests
  add constraint owner_requests_payment_fk
  foreign key (payment_id) references public.payments(id) on delete set null;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index leagues_created_by_idx on public.leagues(created_by);
create index leagues_status_idx on public.leagues(status);
create index teams_league_id_idx on public.teams(league_id);
create index players_league_id_idx on public.players(league_id);
create index bids_league_player_idx on public.bids(league_id, player_id, created_at desc);
create index owner_requests_owner_idx on public.owner_requests(owner_user_id);
create index payments_league_idx on public.payments(league_id);
create index audit_logs_league_idx on public.audit_logs(league_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leagues_touch_updated_at
before update on public.leagues
for each row execute function public.touch_updated_at();

create trigger owner_requests_touch_updated_at
before update on public.owner_requests
for each row execute function public.touch_updated_at();

create or replace function public.is_league_admin(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.leagues
    where id = target_league_id
      and created_by = auth.uid()
  );
$$;

create or replace function public.has_approved_owner_access(target_league_id uuid, target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner_requests
    where league_id = target_league_id
      and team_id = target_team_id
      and owner_user_id = auth.uid()
      and status = 'Approved'
      and payment_status = 'paid'
  );
$$;

alter table public.profiles enable row level security;
alter table public.leagues enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.bids enable row level security;
alter table public.owner_requests enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles can read own profile" on public.profiles
for select using (id = auth.uid());

create policy "profiles can insert own profile" on public.profiles
for insert with check (id = auth.uid());

create policy "profiles can update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "public can view public leagues" on public.leagues
for select using (visibility = 'public' or created_by = auth.uid());

create policy "admins create own leagues" on public.leagues
for insert with check (created_by = auth.uid());

create policy "admins update own leagues" on public.leagues
for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "admins delete own draft leagues" on public.leagues
for delete using (created_by = auth.uid() and status = 'Draft');

create policy "view teams in visible leagues" on public.teams
for select using (
  exists (
    select 1 from public.leagues
    where leagues.id = teams.league_id
      and (leagues.visibility = 'public' or leagues.created_by = auth.uid())
  )
);

create policy "admins manage league teams" on public.teams
for all using (public.is_league_admin(league_id)) with check (public.is_league_admin(league_id));

create policy "view players in visible leagues" on public.players
for select using (
  exists (
    select 1 from public.leagues
    where leagues.id = players.league_id
      and (leagues.visibility = 'public' or leagues.created_by = auth.uid())
  )
);

create policy "admins manage league players" on public.players
for all using (public.is_league_admin(league_id)) with check (public.is_league_admin(league_id));

create policy "view bids in visible leagues" on public.bids
for select using (
  exists (
    select 1 from public.leagues
    where leagues.id = bids.league_id
      and (leagues.visibility = 'public' or leagues.created_by = auth.uid())
  )
);

create policy "admins place admin-managed bids" on public.bids
for insert with check (
  public.is_league_admin(league_id)
  and exists (select 1 from public.leagues where id = league_id and management_mode = 'admin')
);

create policy "approved owners place owner bids" on public.bids
for insert with check (
  public.has_approved_owner_access(league_id, team_id)
  and exists (select 1 from public.leagues where id = league_id and management_mode = 'owner' and status = 'Live')
);

create policy "admins can undo bids" on public.bids
for update using (public.is_league_admin(league_id)) with check (public.is_league_admin(league_id));

create policy "owners view their requests" on public.owner_requests
for select using (owner_user_id = auth.uid() or public.is_league_admin(league_id));

create policy "owners request access" on public.owner_requests
for insert with check (owner_user_id = auth.uid());

create policy "admins update owner requests" on public.owner_requests
for update using (public.is_league_admin(league_id)) with check (public.is_league_admin(league_id));

create policy "owners view own payments and admins view league payments" on public.payments
for select using (
  public.is_league_admin(league_id)
  or exists (
    select 1 from public.owner_requests
    where owner_requests.id = payments.owner_request_id
      and owner_requests.owner_user_id = auth.uid()
  )
);

create policy "admins record league payments" on public.payments
for insert with check (public.is_league_admin(league_id));

create policy "admins update league payments" on public.payments
for update using (public.is_league_admin(league_id)) with check (public.is_league_admin(league_id));

create policy "admins view audit logs" on public.audit_logs
for select using (public.is_league_admin(league_id));

create policy "admins create audit logs" on public.audit_logs
for insert with check (public.is_league_admin(league_id));

alter publication supabase_realtime add table public.leagues;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.owner_requests;
alter publication supabase_realtime add table public.payments;

insert into storage.buckets (id, name, public)
values ('auction-arena-media', 'auction-arena-media', true)
on conflict (id) do nothing;

create policy "public reads auction media" on storage.objects
for select using (bucket_id = 'auction-arena-media');

create policy "authenticated uploads auction media" on storage.objects
for insert to authenticated with check (bucket_id = 'auction-arena-media');

create policy "authenticated updates auction media" on storage.objects
for update to authenticated using (bucket_id = 'auction-arena-media') with check (bucket_id = 'auction-arena-media');
