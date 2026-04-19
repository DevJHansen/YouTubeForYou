import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { polar } from "@/lib/env";
import { AuthShell } from "../auth/AuthShell";

export default async function UpgradePage() {
  const session = await getSession();
  if (!session) redirect("/auth/signup?next=/upgrade");
  if (session.plan === "pro") redirect("/billing");

  const cfg = polar();
  const mk = (productId: string) => {
    const qs = new URLSearchParams({
      products: productId,
      customerExternalId: session.userId,
      customerEmail: session.email,
    });
    return `/api/checkout?${qs.toString()}`;
  };

  return (
    <AuthShell title="Upgrade to Pro" subtitle={session.email}>
      <div className="upgrade-grid">
        <Link href={mk(cfg.productIdMonthly)} className="upgrade-card">
          <div className="upgrade-name">Monthly</div>
          <div className="upgrade-price"><strong>$4.99</strong><span>/ month</span></div>
          <div className="upgrade-sub">Cancel anytime.</div>
        </Link>
        <Link href={mk(cfg.productIdAnnual)} className="upgrade-card upgrade-card--feature">
          <span className="upgrade-badge">Save 35%</span>
          <div className="upgrade-name">Annual</div>
          <div className="upgrade-price"><strong>$39</strong><span>/ year</span></div>
          <div className="upgrade-sub">Best value — $3.25/mo.</div>
        </Link>
      </div>
      <ul className="upgrade-features">
        <li>Scheduled focus mode</li>
        <li>Auto-skip sponsors</li>
        <li>Session budgets</li>
        <li>Clickbait warnings</li>
        <li>Analytics &amp; streaks</li>
        <li>Sync settings across devices</li>
      </ul>
      <p className="auth-alt">
        Changed your mind? <Link href="/account">Back to account</Link>
      </p>
    </AuthShell>
  );
}
