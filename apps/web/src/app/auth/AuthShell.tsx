import Link from "next/link";
import { Icon } from "@/components/landing/Icon";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <Link href="/" className="auth-brand">
        <Icon name="mark" size={22} />
        <span>ForYou</span>
      </Link>
      <div className="auth-card">
        <h1>{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
