import { Icon } from "./Icon";

export function Nav() {
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
        <a className="nav-cta" href="#install">
          <Icon name="chrome" size={14} />
          Add to Chrome
        </a>
      </div>
    </header>
  );
}
