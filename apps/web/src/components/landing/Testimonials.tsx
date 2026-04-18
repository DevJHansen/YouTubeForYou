const TESTIMONIALS = [
  {
    q: "I installed it as an experiment. A week in, my screen time dropped 47%. I haven't seen a Short since.",
    n: "Maya O.",
    r: "Product designer · Brooklyn",
    i: "MO",
  },
  {
    q: "The search-only homepage is the single best decision I've made about YouTube in ten years. It treats me like an adult.",
    n: "Jaiveer S.",
    r: "PhD student · Toronto",
    i: "JS",
  },
  {
    q: "The puzzle-to-bypass is genius. Every time I try to open the feed my brain has to answer for itself. Broke the habit in a week.",
    n: "Elena R.",
    r: "Software engineer · Madrid",
    i: "ER",
  },
];

export function Testimonials() {
  return (
    <section className="section" id="reviews">
      <div className="container-x">
        <div className="section-head">
          <span className="tag">
            <span className="dot">●</span> 03 / what people say
          </span>
          <h2>People who got their time back.</h2>
          <p>
            Unsolicited reviews from the Chrome Web Store, lightly edited for
            length.
          </p>
        </div>
        <div className="testimonials">
          {TESTIMONIALS.map((t, i) => (
            <div className="tcard" key={i}>
              <div className="stars">★★★★★</div>
              <div className="q">{t.q}</div>
              <div className="who">
                <div className="av">{t.i}</div>
                <div className="meta">
                  <div className="n">{t.n}</div>
                  <div className="r">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
