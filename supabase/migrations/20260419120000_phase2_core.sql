-- Phase 2: core tables for auth mirror, billing, and AI quota tracking.
-- Writes are service-role only except where explicitly noted.

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- users ----------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  polar_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy "users read own row" on public.users
  for select using (auth.uid() = id);

-- Auto-provision a public.users row whenever someone signs up.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- subscriptions ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  polar_subscription_id text not null unique,
  polar_product_id text not null,
  status text not null check (status in ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "users read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------- webhook_events (service-role only) ----------
create table public.webhook_events (
  polar_event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.webhook_events enable row level security;
-- No policies: only service role can read/write.

-- ---------- ai_usage ----------
create table public.ai_usage (
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  feature text not null,
  count integer not null default 0,
  primary key (user_id, date, feature)
);

alter table public.ai_usage enable row level security;

create policy "users read own ai_usage" on public.ai_usage
  for select using (auth.uid() = user_id);
