# YouTube ForYou — monorepo guide

## What this is

A YouTube distraction blocker with a free Chrome extension and a Pro plan sold through a web app. Side project — keep things simple. No premature abstractions.

## Layout

```
apps/
  extension/   # Chrome MV3 extension (the product — free tier)
  web/         # Next.js 16 + TS + Tailwind 4 (landing page, billing, Pro APIs)
packages/      # (shared TS libs when needed — empty for now)
.claude/
  commands/    # Project slash commands (e.g., /ship)
  skills/      # Project-specific skills
```

## Stack

- **Extension:** vanilla JS, Manifest V3, `chrome.storage.sync` for settings.
- **Web:** Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, TypeScript.
- **Auth/DB:** Supabase (Pro plan, branching: `main` = prod, `dev` = permanent dev branch).
- **Billing:** Polar.sh (sandbox for dev, live for prod).
- **Hosting:** Vercel.
- **AI:** Google Gemini (2.5 Flash-Lite for classification, 2.5 Flash for summaries — cheapest frontier option). Strict quotas — see `.claude/skills/ai-cost-safety/`.

## Branches

- `main` — prod. Auto-deploys to Vercel prod, auto-migrates Supabase main branch.
- `dev` — permanent dev branch. Preview deploys, Supabase `dev` branch.
- Feature branches → PR to `dev` → merge to `main` for release.

## Free vs Pro

**Free (everything shipped today):** homepage blocker, puzzle bypass, hide shorts/comments/recommended.

**Pro (building):**
- Scheduled focus mode (time-based on/off for settings)
- Analytics (shorts blocked, watch time, long-form vs shorts, etc.)
- Auto-skip sponsors (via SponsorBlock API — free, crowd-sourced)
- Session budgets (watch-time limits)
- Clickbait warnings (LLM-backed, with "replace with genuine title" button)

## Important constraints

1. **AI cost safety is non-negotiable.** Every LLM-backed feature needs quotas + caching. See `.claude/skills/ai-cost-safety/`.
2. **Never put API keys in the extension.** AI calls route through the web backend.
3. **RLS on every user-data table in Supabase.** See `.claude/skills/supabase-patterns/`.
4. **Webhook signatures verified before parsing body.** See `.claude/skills/polar-billing/`.

## Common workflows

- Starting a feature: use `/feature-dev` (from `feature-dev` plugin) to plan, then implement, then `/ship` before PR.
- Pre-PR: run `/ship` — chains simplify + security-review + code review.
- Security sweep: `/security-review` (from `security-guidance` plugin).

## What to push back on

The user is building this for fun and small revenue, not to replace their job. Push back on anything that adds complexity without clear value: elaborate abstractions, premature optimization, infra beyond what's needed. Favor boring, readable code.
