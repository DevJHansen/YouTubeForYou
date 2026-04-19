import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "../auth/AuthShell";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/account");

  return (
    <AuthShell title="Account" subtitle={session.email}>
      <div className="auth-meta">
        <div>
          <span>Plan</span>
          <strong>{session.plan.toUpperCase()}</strong>
        </div>
      </div>
      <div className="auth-actions">
        {session.plan === "pro" ? (
          <Link href="/billing" className="btn-ghost auth-submit">
            Manage subscription
          </Link>
        ) : (
          <Link href="/upgrade" className="btn-primary auth-submit">
            Upgrade to Pro
          </Link>
        )}
        <form action="/auth/signout" method="post">
          <button className="btn-ghost auth-submit" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
