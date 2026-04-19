import { Webhooks } from "@polar-sh/nextjs";
import { polar } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";

const cfg = polar();

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
]);

type SubStatus = "active" | "canceled" | "past_due" | "incomplete";

function normalizeStatus(raw: string): SubStatus {
  if (raw === "active" || raw === "trialing") return "active";
  if (raw === "canceled" || raw === "revoked") return "canceled";
  if (raw === "past_due" || raw === "unpaid") return "past_due";
  return "incomplete";
}

async function syncSubscription(sub: Subscription) {
  const service = createServiceClient();
  const userId = sub.customer?.externalId ?? null;
  if (!userId) {
    console.warn(`[polar] subscription ${sub.id} missing externalCustomerId; skipping`);
    return;
  }
  const status = normalizeStatus(sub.status);

  await service.from("subscriptions").upsert(
    {
      user_id: userId,
      polar_subscription_id: sub.id,
      polar_product_id: sub.productId,
      status,
      current_period_end: sub.currentPeriodEnd?.toISOString() ?? null,
      cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "polar_subscription_id" },
  );

  const plan = status === "active" ? "pro" : "free";
  await service
    .from("users")
    .update({
      plan,
      polar_customer_id: sub.customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export const POST = Webhooks({
  webhookSecret: cfg.webhookSecret,
  onPayload: async (payload) => {
    const service = createServiceClient();
    const eventId =
      (payload as { id?: string }).id ??
      `${payload.type}:${JSON.stringify(payload.data).slice(0, 96)}`;

    const { error: insertError } = await service.from("webhook_events").insert({
      polar_event_id: eventId,
      event_type: payload.type,
      payload: payload as unknown as Record<string, unknown>,
    });

    if (insertError) {
      if ((insertError as { code?: string }).code === "23505") {
        // Duplicate — already processed.
        return;
      }
      throw insertError;
    }

    if (SUBSCRIPTION_EVENTS.has(payload.type)) {
      await syncSubscription(payload.data as Subscription);
    }

    await service
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("polar_event_id", eventId);
  },
});
