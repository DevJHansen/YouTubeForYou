"use client";

import { useState } from "react";
import { Icon } from "./Icon";

type PopupKey =
  | "home"
  | "shorts"
  | "comments"
  | "sidebar"
  | "puzzle"
  | "schedule"
  | "sponsor";

const ROW_DEFAULTS: Record<PopupKey, boolean> = {
  home: true,
  shorts: true,
  comments: false,
  sidebar: false,
  puzzle: true,
  schedule: false,
  sponsor: false,
};

export function HeroPopupMock() {
  const [rows, setRows] = useState(ROW_DEFAULTS);
  const toggle = (k: PopupKey) => setRows((r) => ({ ...r, [k]: !r[k] }));
  const activeCount = Object.values(rows).filter(Boolean).length;

  return (
    <div className="popup-wrap">
      <div className="browser-chrome">
        <div className="browser-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="browser-url">
          <span className="lock">
            <Icon name="lock" size={10} />
          </span>
          youtube.com
        </div>
        <div className="browser-ext">
          <Icon name="mark" size={12} stroke={2.2} />
        </div>
      </div>
      <div className="popup">
        <div className="popup-header">
          <div className="title">
            <span className="brand-mark">
              <Icon name="mark" size={10} stroke={2.2} />
            </span>
            ForYou
          </div>
          <div className="status">Active · {activeCount} rules</div>
        </div>
        <div className="popup-stat">
          <div>
            <div className="num">1,247</div>
            <div className="lbl">Shorts blocked</div>
          </div>
          <div>
            <div className="num">
              8.2
              <span style={{ fontSize: "14px", color: "var(--text-faint)" }}>
                h
              </span>
            </div>
            <div className="lbl">Saved this week</div>
          </div>
        </div>
        <div className="popup-list">
          <PopupRow
            icon="home"
            label="Block homepage feed"
            on={rows.home}
            onClick={() => toggle("home")}
          />
          <PopupRow
            icon="shorts"
            label="Hide Shorts"
            on={rows.shorts}
            onClick={() => toggle("shorts")}
          />
          <PopupRow
            icon="comment"
            label="Hide comments"
            on={rows.comments}
            onClick={() => toggle("comments")}
          />
          <PopupRow
            icon="sidebar"
            label="Hide recommendations"
            on={rows.sidebar}
            onClick={() => toggle("sidebar")}
          />
          <PopupRow
            icon="puzzle"
            label="Puzzle to bypass"
            on={rows.puzzle}
            onClick={() => toggle("puzzle")}
          />
          <PopupRow
            icon="schedule"
            label="Scheduled focus"
            on={rows.schedule}
            onClick={() => toggle("schedule")}
            pro
          />
          <PopupRow
            icon="sponsor"
            label="Auto-skip sponsors"
            on={rows.sponsor}
            onClick={() => toggle("sponsor")}
            pro
          />
        </div>
      </div>
    </div>
  );
}

function PopupRow({
  icon,
  label,
  on,
  onClick,
  pro,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  on: boolean;
  onClick: () => void;
  pro?: boolean;
}) {
  return (
    <div className={`popup-row ${on ? "active" : ""}`} onClick={onClick}>
      <div className="left">
        <span className="icon">
          <Icon name={icon} size={14} />
        </span>
        <span>{label}</span>
        {pro && <span className="pro-badge">PRO</span>}
      </div>
      <span className={`toggle ${on ? "on" : ""}`} />
    </div>
  );
}
