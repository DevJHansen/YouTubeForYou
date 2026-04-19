import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container-x">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark">
                <Icon name="mark" size={14} stroke={2.2} />
              </span>
              YouTube ForYou
            </div>
            <p>
              A Chrome extension for taking back control of your YouTube
              experience, so you don&apos;t fall down attention traps.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#demo">Demo</a>
              </li>
              <li>
                <a href="https://github.com/DevJHansen/YouTubeForYou">
                  Source
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2026 YouTube ForYou · Not affiliated with YouTube or Google
          </span>
          <span>MIT · v2.0</span>
        </div>
      </div>
    </footer>
  );
}
