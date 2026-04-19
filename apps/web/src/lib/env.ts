// Vercel env scoping handles prod vs preview: each scope has its own values
// for the same unsuffixed var names. Locally, .env.local should hold dev/sandbox values.

function req(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

// NEXT_PUBLIC_* vars must be accessed via literal dot notation so Next.js
// inlines the value into the client bundle at build time. `process.env[name]`
// with a variable key stays as a runtime lookup, which is empty in the browser.
export const supabaseUrl = () => req("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () =>
  req("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const supabaseServiceKey = () =>
  req("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);

export type PolarEnv = "sandbox" | "live";

export function polarEnv(): PolarEnv {
  return process.env.POLAR_ENV === "live" ? "live" : "sandbox";
}

export function polar() {
  return {
    env: polarEnv(),
    accessToken: req("POLAR_ACCESS_TOKEN", process.env.POLAR_ACCESS_TOKEN),
    webhookSecret: req("POLAR_WEBHOOK_SECRET", process.env.POLAR_WEBHOOK_SECRET),
    productIdMonthly: req("POLAR_PRODUCT_ID_PRO_MONTHLY", process.env.POLAR_PRODUCT_ID_PRO_MONTHLY),
    productIdAnnual: req("POLAR_PRODUCT_ID_PRO_ANNUAL", process.env.POLAR_PRODUCT_ID_PRO_ANNUAL),
    server: (polarEnv() === "live" ? "production" : "sandbox") as "production" | "sandbox",
  };
}

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
