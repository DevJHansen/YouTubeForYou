import { Comparator } from "./Comparator";
import { Icon } from "./Icon";

export function Demo() {
  return (
    <section className="section" id="demo">
      <div className="container-x">
        <div className="section-head">
          <span className="tag">
            <span className="dot">●</span> 01 / the difference
          </span>
          <h2>One click. A quieter YouTube.</h2>
          <p>
            Drag to compare. On the left, the default homepage — infinite
            scroll, Shorts, algorithmic rabbit holes. On the right, the same
            tab with ForYou active.
          </p>
        </div>

        <Comparator before={<YTBefore />} after={<YTAfter />} />

        <div className="stats">
          <div>
            <div className="num">
              <em>6.2h</em>
            </div>
            <div className="lbl">Avg. weekly time saved</div>
          </div>
          <div>
            <div className="num">2.1k</div>
            <div className="lbl">Active users</div>
          </div>
          <div>
            <div className="num">
              4.9<span style={{ color: "var(--text-faint)" }}>/5</span>
            </div>
            <div className="lbl">Chrome store rating</div>
          </div>
          <div>
            <div className="num">0</div>
            <div className="lbl">Data collected. Ever.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function YTBefore() {
  return (
    <div className="yt">
      <div className="yt-top">
        <div className="yt-logo" />
        <div className="search" />
      </div>
      <div className="yt-side">
        <div className="item big" />
        <div className="item" />
        <div className="item" />
        <div className="item" />
        <div className="item big" />
        <div className="item" />
        <div className="item" />
      </div>
      <div className="yt-main">
        <div className="yt-shorts">
          <div className="s" />
          <div className="s" />
          <div className="s" />
          <div className="s" />
          <div className="s" />
          <div className="s" />
          <div className="s" />
        </div>
        <div className="yt-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="yt-card" key={i}>
              <div className="thumb" />
              <div className="bar" />
              <div className="bar short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YTAfter() {
  return (
    <div className="yt clean">
      <div className="big-logo">
        <span className="m">
          <Icon name="mark" size={14} stroke={2.2} />
        </span>
        Search something on purpose.
      </div>
      <div className="big-search">
        <Icon name="search" size={12} />
        <span>What did you come here to watch?</span>
        <span className="cursor" />
      </div>
      <div className="hint">· homepage blocked · shorts hidden · no traps ·</div>
    </div>
  );
}
