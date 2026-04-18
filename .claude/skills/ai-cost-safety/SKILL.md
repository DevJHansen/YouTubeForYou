---
name: ai-cost-safety
description: Use when adding any feature that calls an LLM or other paid external API (clickbait detection, TLDR, translations). Enforces quotas, caching, and BYO-key patterns so a single user cannot bankrupt the business.
---

# AI cost safety — mandatory patterns

This is a side project with a small revenue target. A single heavy user or a malicious one can cost more in API fees than the monthly subscription. Every AI-backed feature MUST implement these guardrails.

## Non-negotiables

1. **Per-user quota, enforced server-side, backed by the DB.** Before every LLM call, check and increment a counter in `ai_usage`. If over limit, return 429.
2. **Cache aggressively with a public key.** Clickbait verdict and TLDR summary are per-video, not per-user — one user paying the cost warms the cache for everyone else. Cache in DB with TTL (7–30 days).
3. **Free tier: no AI calls.** Period. If a free user hits a pro endpoint, 402.
4. **Rate limit at the edge.** Even Pro users get rate-limited (e.g., 10 req/min) to stop runaway clients.
5. **Log every call with cost estimate.** At minimum: `user_id, feature, model, input_tokens, output_tokens, estimated_cost_usd, created_at`. Review weekly.

## Monthly caps per feature (initial, tune later)

| Feature             | Free | Pro  | Hard cap / user (any plan) |
|---------------------|------|------|----------------------------|
| Clickbait detection | 0    | 500  | 1000                       |
| TLDR summaries      | 0    | 100  | 200                        |
| Translations        | 0    | 50   | 100                        |

The "hard cap" applies even if a user buys multiple Pro subs or abuses proration. Enforce via a circuit breaker on the backend.

## Caching strategy

Clickbait + TLDR are per-video, so cache by `video_id`:

```ts
// Pseudo
const cached = await db.clickbait_cache.select(video_id);
if (cached && !expired(cached)) return cached.verdict;

const verdict = await llm.detect(video_title, channel, thumbnail_url);
await db.clickbait_cache.upsert({ video_id, verdict, created_at: now() });
await db.ai_usage.increment(user_id, 'clickbait_detection');
return verdict;
```

Cost falls by ~95% once the top-1000 videos per user's niche are warm.

## Model selection

Default to the cheapest model that gives acceptable quality. For clickbait: `claude-haiku-4-5` is plenty. For TLDR: `claude-sonnet-4-6` with a strict token budget (≤ 500 output). Never reach for Opus.

Explicit token caps on every call:

```ts
const resp = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 200, // clickbait verdict is a short JSON
  messages: [...],
});
```

## Prompt caching

Use Anthropic's prompt caching for repeated system prompts. Mark the system prompt with `cache_control: { type: 'ephemeral' }`. Hit rates on classification features should be >90%.

## BYO-key as escape hatch

For power users who want unlimited use, offer "bring your own API key":
- User pastes their Anthropic/OpenAI key into settings.
- Key stored encrypted in DB (AES-GCM with a per-user data key).
- When BYO-key is set, skip quota checks for that user and route calls using their key.
- Benefit: they pay their own costs; we charge a lower base fee for the app.

## Kill switches

Environment flag `AI_FEATURES_ENABLED=false` must short-circuit every AI endpoint to return 503. Flip this if provider pricing spikes or we see abuse.

## Review checklist for PRs that add AI calls

- [ ] Quota check before call
- [ ] Usage counter incremented after call
- [ ] Cache read before call, cache write after call (where applicable)
- [ ] `max_tokens` set explicitly
- [ ] Cheapest viable model selected
- [ ] Free tier returns 402, not a stub response that still costs money
- [ ] Cost logged to `ai_usage`
- [ ] Rate limit at route level
- [ ] Kill switch respected
