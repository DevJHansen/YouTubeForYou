---
name: supabase-patterns
description: Use when writing migrations, RLS policies, or server actions that hit Supabase. Covers auth setup, RLS on user-scoped tables, branching, and service-role vs anon-key boundaries.
---

# Supabase — project conventions

Supabase is our database + auth. We use Supabase branching (requires Pro plan — we have it) with one permanent `dev` branch and `main` as prod.

## Environments & keys

| Env   | Branch         | Where keys live                       |
|-------|----------------|----------------------------------------|
| Local | local dev env  | `.env.local` (gitignored)             |
| Dev   | `dev` branch   | Vercel Preview env + local `.env`     |
| Prod  | `main` branch  | Vercel Production env                 |

Keys:
- `NEXT_PUBLIC_SUPABASE_URL` — safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe to expose; always used with RLS
- `SUPABASE_SERVICE_ROLE_KEY` — NEVER expose, NEVER bundle into client. Only used in server code (route handlers, server actions, webhooks).

## Key boundary rule

If a code path runs in the browser or extension, it uses the **anon key** + RLS. If it runs on the server with elevated privileges (webhook handlers, admin jobs, cross-user reads), it uses the **service role key** — and MUST enforce authorization manually, because service role bypasses RLS.

A service-role client must never be imported into a file also shipped to the browser. Put them in different files and audit imports.

## Table conventions

- Primary keys: `id uuid default gen_random_uuid() primary key`
- Timestamps: `created_at timestamptz default now() not null`, `updated_at timestamptz default now() not null` with a trigger
- Soft delete (when needed): `deleted_at timestamptz null` + views that filter it out
- User ownership: `user_id uuid not null references auth.users(id) on delete cascade`

## Row-Level Security (mandatory)

Every table that touches user data MUST have RLS enabled and explicit policies. Never disable RLS "temporarily" — use the service role key from server code if you need to bypass.

Standard pattern for user-owned data:

```sql
alter table foo enable row level security;

create policy "users read own foo" on foo
  for select using (auth.uid() = user_id);

create policy "users insert own foo" on foo
  for insert with check (auth.uid() = user_id);

create policy "users update own foo" on foo
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Webhook-written tables (e.g., `subscriptions`, `webhook_events`) usually have NO user-writable policies — only the service role writes them.

## Core tables (planned)

- `users` — mirrors `auth.users` with app-specific fields: `plan ('free' | 'pro')`, `pro_until timestamptz`, `polar_customer_id`
- `subscriptions` — Polar subscription state (source of truth is Polar, this is a cache)
- `webhook_events` — dedupe log, `provider_event_id text unique`
- `ai_usage` — `(user_id, feature, month)` rolling counters for quota enforcement
- `session_budgets` — Pro feature: user-configured daily/weekly watch budgets
- `clickbait_cache` — video_id → verdict, TTL-evicted
- `tldr_cache` — video_id → summary text, TTL-evicted

## Migrations

All schema changes go through `supabase/migrations/` — no dashboard edits to prod. Workflow:

1. Start local Supabase: `supabase start`
2. Make change via `supabase migration new <name>` + SQL file
3. Test locally: `supabase db reset`
4. Push to dev branch: merge PR → Supabase applies to `dev` branch automatically via GitHub integration
5. Merge to main → applies to prod

## Auth

- Email + password for now. Add OAuth providers (Google) when we have traction.
- Server-side session check: `createServerClient()` → `getUser()`. Never trust `getSession()` in server code (it only reads the cookie, doesn't verify).
- Extension auth: popup opens our web app's `/auth/extension` page in a new tab → after login we write the access token to `chrome.storage.local` via a small bridge script → extension reads it.

## Cost awareness

- Free tier: 500MB DB, 1GB file storage, 50K MAU — fine for early stage.
- Pro tier ($25/mo): 8GB DB, branching, PITR — we're here.
- Cache-heavy tables (`clickbait_cache`, `tldr_cache`) — TTL-evict aggressively. A cleanup cron should delete rows older than 7 days.
