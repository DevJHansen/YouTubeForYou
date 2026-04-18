import { Icon } from "./Icon";

export function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="container-x">
        <div className="section-head">
          <span className="tag">
            <span className="dot">●</span> 04 / pricing
          </span>
          <h2>Free to focus. Pro if you want more.</h2>
          <p>
            Most people never need to upgrade. Pro adds scheduling, analytics,
            sponsor-skipping, and clickbait warnings.
          </p>
        </div>
        <div className="pricing">
          <div className="pcard">
            <div className="plan-name">Free</div>
            <div className="price">
              <span className="n">$0</span>
              <span className="p">/ forever</span>
            </div>
            <div className="blurb">
              Everything you need to take YouTube back.
            </div>
            <ul>
              <li>
                <span className="c">✓</span>Block homepage feed
              </li>
              <li>
                <span className="c">✓</span>Hide Shorts everywhere
              </li>
              <li>
                <span className="c">✓</span>Hide comments &amp; recommendations
              </li>
              <li>
                <span className="c">✓</span>Puzzle to bypass
              </li>
              <li>
                <span className="c">✓</span>Open source &amp; local-only
              </li>
            </ul>
            <a href="#install" className="btn-ghost cta">
              <Icon name="chrome" size={14} />
              Add to Chrome
            </a>
          </div>
          <div className="pcard pro">
            <div className="pop">PRO</div>
            <div className="plan-name">Pro</div>
            <div className="price">
              <span className="n">$4.99</span>
              <span className="p">/ month</span>
            </div>
            <div className="price-alt">or $39 / year — save 35%</div>
            <div className="blurb">
              For people who want the full focus toolkit.
            </div>
            <ul>
              <li>
                <span className="c">✓</span>Everything in Free
              </li>
              <li>
                <span className="c">✓</span>Scheduled focus mode
              </li>
              <li>
                <span className="c">✓</span>Auto-skip sponsors
              </li>
              <li>
                <span className="c">✓</span>Session budgets &amp; analytics
              </li>
              <li>
                <span className="c">✓</span>Clickbait warnings
              </li>
              <li>
                <span className="c">✓</span>Sync settings across devices
              </li>
            </ul>
            <a href="#install" className="btn-primary cta">
              <Icon name="arrow" size={14} />
              Start Pro
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
