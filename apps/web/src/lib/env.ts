// Vercel env scoping handles prod vs preview: each scope has its own values
// for the same unsuffixed var names. Locally, .env.local should hold dev/sandbox values.

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const supabaseUrl = () => req("NEXT_PUBLIC_SUPABASE_URL");
export const supabaseAnonKey = () => req("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const supabaseServiceKey = () => req("SUPABASE_SERVICE_ROLE_KEY");

export type PolarEnv = "sandbox" | "live";

export function polarEnv(): PolarEnv {
  return process.env.POLAR_ENV === "live" ? "live" : "sandbox";
}

export function polar() {
  return {
    env: polarEnv(),
    accessToken: req("POLAR_ACCESS_TOKEN"),
    webhookSecret: req("POLAR_WEBHOOK_SECRET"),
    productIdMonthly: req("POLAR_PRODUCT_ID_PRO_MONTHLY"),
    productIdAnnual: req("POLAR_PRODUCT_ID_PRO_ANNUAL"),
    server: (polarEnv() === "live" ? "production" : "sandbox") as "production" | "sandbox",
  };
}

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
