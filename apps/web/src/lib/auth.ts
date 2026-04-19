import { createClient } from "./supabase/server";
import { createServiceClient } from "./supabase/service";

export type AppSession = {
  userId: string;
  email: string;
  plan: "free" | "pro";
};

export async function getSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Read plan via service role — RLS-safe, doesn't depend on the row existing via user context.
  const service = createServiceClient();
  const { data } = await service
    .from("users")
    .select("plan, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: data?.email ?? user.email ?? "",
    plan: data?.plan === "pro" ? "pro" : "free",
  };
}
