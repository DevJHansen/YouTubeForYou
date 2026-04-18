import { FEATURES } from "./features-data";
import { FeaturesInteractive } from "./FeaturesInteractive";

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container-x">
        <div className="section-head">
          <span className="tag">
            <span className="dot">●</span> 02 / the toolkit
          </span>
          <h2>Every distraction, individually switchable.</h2>
          <p>
            Turn on what helps you focus. Leave the rest of YouTube alone.
            Click any row to see it in action.
          </p>
        </div>

        <FeaturesInteractive />

        {/* Hidden for SEO: every feature's full copy rendered in the DOM so crawlers
            index it even though only the active one shows visually. */}
        <div className="sr-only" aria-hidden="true">
          {FEATURES.map((f) => (
            <article key={f.id}>
              <h3>{f.title}</h3>
              <h4>{f.heading}</h4>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
