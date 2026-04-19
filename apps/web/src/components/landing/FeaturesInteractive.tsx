"use client";

import { useState } from "react";
import { FEATURES, type Feature } from "./features-data";

export function FeaturesInteractive() {
  const [activeId, setActiveId] = useState<Feature["id"]>(FEATURES[0].id);
  const active = FEATURES.find((f) => f.id === activeId) ?? FEATURES[0];

  return (
    <div className="features-layout">
      <div className="feature-list">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            className={`feature-item ${activeId === f.id ? "active" : ""}`}
            onClick={() => setActiveId(f.id)}
          >
            <span className="num">{f.num}</span>
            <span className="title">
              {f.title}
              {f.pro && <span className="pro-tag">PRO</span>}
            </span>
            <span className={`toggle ${activeId === f.id ? "on" : ""}`} />
          </div>
        ))}
      </div>

      <div className="feature-preview">
        <span className="preview-tag">{active.tag}</span>
        <h3>{active.heading}</h3>
        <p>{active.body}</p>
        <div className="preview-canvas" key={active.id}>
          {active.preview}
        </div>
      </div>
    </div>
  );
}
