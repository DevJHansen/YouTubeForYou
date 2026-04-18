import { Icon } from "./Icon";
import { HeroPopupMock } from "./HeroPopupMock";

export function Hero() {
  return (
    <section className="hero">
      <div className="container-x hero-grid">
        <div>
          <div className="hero-eyebrow">
            <span className="pulse" />
            <span className="mono">v2.0 · Chrome + Edge + Arc</span>
          </div>
          <h1>
            Take back your
            <br />
            <em>feed.</em>
          </h1>
          <p className="hero-sub">
            A Chrome extension that hides YouTube&apos;s attention traps —
            homepage feed, Shorts, comments, and recommendations — so you watch
            what you came for and leave.
          </p>
          <div className="hero-cta-row">
            <a className="btn-primary" href="#install">
              <Icon name="chrome" size={16} />
              Install free — 30 sec
            </a>
            <a className="btn-ghost" href="#demo">
              See how it works
              <Icon name="arrow" size={14} />
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <span className="stars">★★★★★</span> &nbsp;4.9 · 184 reviews
            </span>
            <span className="dot" />
            <span>2,100+ users</span>
            <span className="dot" />
            <span>Open source</span>
          </div>
        </div>

        <HeroPopupMock />
      </div>
    </section>
  );
}
