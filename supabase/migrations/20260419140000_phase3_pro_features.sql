-- Phase 3: tables backing analytics and clickbait detection.

-- ---------- analytics_daily ----------
-- One row per user per day. Extension sums counters locally and syncs periodically.
create table public.analytics_daily (
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  shorts_blocked integer not null default 0,
  seconds_watched_long integer not null default 0,
  seconds_watched_shorts integer not null default 0,
  sponsors_skipped integer not null default 0,
  clickbait_flagged integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create index analytics_daily_user_idx on public.analytics_daily(user_id, date desc);

alter table public.analytics_daily enable row level security;

create policy "users read own analytics" on public.analytics_daily
  for select using (auth.uid() = user_id);
-- Writes: service role only (through /api/analytics/sync).

-- ---------- clickbait_cache ----------
-- Keyed by video_id. Shared across users. Stale entries are re-checked when created_at is older than 7d.
create table public.clickbait_cache (
  video_id text primary key,
  verdict text not null check (verdict in ('clickbait', 'ok', 'unknown')),
  score numeric,
  genuine_title text,
  reasoning text,
  created_at timestamptz not null default now()
);

alter table public.clickbait_cache enable row level security;
-- No policies: service role only.
