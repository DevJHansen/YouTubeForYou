import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onPayload: async (payload) => {
    console.log(
      `[polar:${process.env.POLAR_ENV ?? "unknown"}] ${payload.type}`,
      JSON.stringify(payload.data).slice(0, 500),
    );
  },
});
