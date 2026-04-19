import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ExtensionBridge } from "./ExtensionBridge";

export default async function ExtensionAuthPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/auth/extension");

  const supabaseSession = await getAccessToken();

  return (
    <ExtensionBridge
      email={session.email}
      plan={session.plan}
      accessToken={supabaseSession?.accessToken ?? ""}
      expiresAt={supabaseSession?.expiresAt ?? 0}
      userId={session.userId}
    />
  );
}

async function getAccessToken() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return {
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at ?? 0,
  };
}
