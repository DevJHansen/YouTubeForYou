import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { AuthShell } from "../auth/AuthShell";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/billing");

  const params = await searchParams;
  const showWelcome = !!params.welcome;

  const service = createServiceClient();
  const { data: sub } = await service
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, polar_product_id")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString()
    : null;

  return (
    <AuthShell title="Billing" subtitle={session.email}>
      {showWelcome && session.plan === "pro" && (
        <div className="auth-note auth-note--ok">Welcome to Pro — enjoy the focus.</div>
      )}
      {showWelcome && session.plan !== "pro" && (
        <div className="auth-note">We&rsquo;re confirming your payment. This can take a few seconds.</div>
      )}

      <div className="auth-meta">
        <div>
          <span>Plan</span>
          <strong>{session.plan.toUpperCase()}</strong>
        </div>
        {sub && (
          <>
            <div>
              <span>Status</span>
              <strong>{sub.status}</strong>
            </div>
            {periodEnd && (
              <div>
                <span>{sub.cancel_at_period_end ? "Ends" : "Renews"}</span>
                <strong>{periodEnd}</strong>
              </div>
            )}
          </>
        )}
      </div>

      <div className="auth-actions">
        {session.plan === "pro" ? (
          <Link href="/api/billing/portal" className="btn-primary auth-submit">
            Manage subscription
          </Link>
        ) : (
          <Link href="/upgrade" className="btn-primary auth-submit">
            Upgrade to Pro
          </Link>
        )}
        <Link href="/account" className="btn-ghost auth-submit">
          Back to account
        </Link>
      </div>
    </AuthShell>
  );
}
