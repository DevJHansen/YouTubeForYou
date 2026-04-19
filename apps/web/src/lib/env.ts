// Central env readers. Vercel env scoping handles prod vs preview;
// local .env.local should point to dev values.

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
  const env = polarEnv();
  const suffix = env === "live" ? "LIVE" : "SANDBOX";
  return {
    env,
    accessToken: req(`POLAR_ACCESS_TOKEN_${suffix}`),
    webhookSecret: req(`POLAR_WEBHOOK_SECRET_${suffix}`),
    productIdMonthly: req(`POLAR_PRODUCT_ID_PRO_MONTHLY_${suffix}`),
    productIdAnnual: req(`POLAR_PRODUCT_ID_PRO_ANNUAL_${suffix}`),
    server: env === "live" ? "production" : ("sandbox" as "production" | "sandbox"),
  };
}

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
