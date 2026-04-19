import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Icon } from "./Icon";

export async function Nav() {
  const session = await getSession();

  return (
    <header className="nav">
      <div className="container-x nav-inner">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="mark" size={14} stroke={2.2} />
          </span>
          YouTube ForYou
        </div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#pricing">Pricing</a>
          <a href="#reviews">Reviews</a>
        </nav>
        <div className="nav-end">
          {session ? (
            <Link className="nav-account" href="/account">
              {session.plan === "pro" ? "Pro account" : "Account"}
            </Link>
          ) : (
            <Link className="nav-account" href="/auth/signin">
              Sign in
            </Link>
          )}
          <a className="nav-cta" href="#install">
            <Icon name="chrome" size={14} />
            Add to Chrome
          </a>
        </div>
      </div>
    </header>
  );
}
