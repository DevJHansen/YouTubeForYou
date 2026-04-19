import { Checkout } from "@polar-sh/nextjs";
import { polar, appUrl } from "@/lib/env";

const cfg = polar();

export const GET = Checkout({
  accessToken: cfg.accessToken,
  server: cfg.server,
  successUrl: `${appUrl()}/billing?welcome=1`,
  theme: "dark",
});
