---
name: polar-billing
description: Use when implementing Polar.sh billing flows (checkout, subscriptions, webhooks, entitlements). Covers sandbox/live environments, webhook signing, and how Pro-plan entitlement is enforced.
---

# Polar.sh integration — project conventions

Polar is our billing provider. One Pro plan (monthly + annual options). Sandbox for dev, live for prod.

## Environments

| Env     | API base                      | Dashboard URL              |
|---------|-------------------------------|----------------------------|
| Sandbox | `https://sandbox-api.polar.sh` | `sandbox.polar.sh`        |
| Live    | `https://api.polar.sh`         | `polar.sh`                |

Never mix. The `POLAR_ENV` env var selects base URL + token. Default to sandbox in non-production builds.

## Secrets (never commit)

- `POLAR_ACCESS_TOKEN` — org-scoped token, separate per env
- `POLAR_WEBHOOK_SECRET` — HMAC secret for webhook verification, separate per env
- `POLAR_PRODUCT_ID_PRO_MONTHLY` / `POLAR_PRODUCT_ID_PRO_ANNUAL`

## Checkout flow

1. User clicks "Upgrade to Pro" in our web app.
2. Server action calls `POST /v1/checkouts/custom` with `product_id` + `customer_email` + `success_url`.
3. Redirect user to the returned `url`.
4. Polar handles payment and redirects to `success_url?checkout_id=...`.
5. Our `/billing/success` page shows a loading state and polls our DB for the active subscription (set by webhook), falling back to a "check again in a sec" message.

## Webhook handling

Webhooks hit `POST /api/webhooks/polar` (Next.js App Router route handler).

**Always verify the signature first.** The raw body must be read before JSON parsing:

```ts
const raw = await req.text();
const sig = req.headers.get("webhook-signature");
if (!verifyPolarSignature(raw, sig, process.env.POLAR_WEBHOOK_SECRET!)) {
  return new Response("invalid signature", { status: 401 });
}
const event = JSON.parse(raw);
```

### Events we handle

- `subscription.created` → insert into `subscriptions` table, flip user's `plan = 'pro'`
- `subscription.updated` → update status (active / past_due / canceled)
- `subscription.canceled` → flip user to `plan = 'free'` at period_end
- `order.created` (for one-time if we ever add it) → grant entitlement

### Idempotency

Polar retries webhooks on failure. Use the event `id` as a dedupe key — insert into an `webhook_events` table with a unique constraint on `provider_event_id` before processing. If the insert fails with a unique violation, ack the webhook and skip.

## Entitlement enforcement

Two layers — belt and suspenders:

1. **Server-side on every Pro API call.** Read `plan` from `users` table via RLS-scoped query. Return 402 if not `pro`. Don't trust client state.
2. **Client-side hint only.** The UI uses a `useIsPro()` hook for showing/hiding upgrade prompts. This is UX, NOT security.

Pro features in the extension (clickbait, TLDR) route through our backend, so the backend check suffices.

## Cost-safe AI features

Pro doesn't mean unlimited. Each AI-backed feature has a per-user monthly cap:

- Clickbait detections: 500/month
- TLDR summaries: 100/month
- (Tune later based on actual cost-per-user data)

When a user hits the cap: return 429 with `retry_after` = next month's 1st. Show "you've hit this month's limit — resets on Xth". Do NOT silently fail.

## Testing

- Use sandbox org + test cards (Polar docs have test card numbers).
- Webhook forwarding in dev: use `polar listen` or a tunnel (ngrok/cloudflared) pointed at `http://localhost:3000/api/webhooks/polar`.
- Every webhook handler must have a unit test with a fixed payload + signature. Don't hit Polar in tests.

## Gotchas

- **Sandbox products aren't visible in live.** You need to create products in BOTH environments; the IDs differ.
- **Don't cache entitlement state for >5 minutes.** Canceled subscriptions need to revoke access promptly.
- **Prorated changes don't send a simple event.** `subscription.updated` will fire; read `status` + `current_period_end`.
