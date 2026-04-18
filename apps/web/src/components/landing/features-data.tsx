import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type FeatureId =
  | "home"
  | "shorts"
  | "puzzle"
  | "comments"
  | "sidebar"
  | "schedule"
  | "sponsor"
  | "clickbait";

export type Feature = {
  id: FeatureId;
  num: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  tag: string;
  heading: string;
  body: string;
  pro?: boolean;
  preview: ReactNode;
};

export const FEATURES: Feature[] = [
  {
    id: "home",
    num: "01",
    icon: "home",
    title: "Block the homepage feed",
    tag: "FOCUS MODE",
    heading: "A search bar. That's it.",
    body: "Replace the infinite homepage with a single search input. Come to find something specific, leave with what you came for.",
    preview: <PreviewHome />,
  },
  {
    id: "shorts",
    num: "02",
    icon: "shorts",
    title: "Hide Shorts everywhere",
    tag: "NO DOOMSCROLL",
    heading: "Vertical video, visibly vanished.",
    body: "Remove Shorts shelves from home, search, subscriptions, and the sidebar. Direct /shorts links redirect you back to the homepage.",
    preview: <PreviewShorts />,
  },
  {
    id: "puzzle",
    num: "03",
    icon: "puzzle",
    title: "Puzzle to bypass",
    tag: "FRICTION BY DESIGN",
    heading: "Want the feed? Solve a math problem.",
    body: "When you try to bypass the homepage blocker, you're greeted with a small math puzzle. Enough friction to break the reflex, not enough to be annoying.",
    preview: <PreviewPuzzle />,
  },
  {
    id: "comments",
    num: "04",
    icon: "comment",
    title: "Hide the comment section",
    tag: "PROTECT YOUR HEAD",
    heading: "Watch without the noise.",
    body: "Keep the comment section hidden by default. Expand only when you actually want to engage — not as a reflex.",
    preview: <PreviewComments />,
  },
  {
    id: "sidebar",
    num: "05",
    icon: "sidebar",
    title: "Kill the recommendations sidebar",
    tag: "NO RABBIT HOLES",
    heading: "Finish the video. Not twelve more.",
    body: "Hide the suggested-videos rail so you return to your own attention when a video ends, instead of the algorithm's.",
    preview: <PreviewSidebar />,
  },
  {
    id: "schedule",
    num: "06",
    icon: "schedule",
    title: "Scheduled focus mode",
    tag: "SET IT & FORGET IT",
    heading: "Blockers on a timer.",
    body: "Turn blockers on automatically during work hours, off on evenings and weekends. Set different rules per day.",
    pro: true,
    preview: <PreviewSchedule />,
  },
  {
    id: "sponsor",
    num: "07",
    icon: "sponsor",
    title: "Auto-skip sponsors",
    tag: "TIME BACK",
    heading: "Sponsor segments, skipped instantly.",
    body: "Powered by SponsorBlock's crowd-sourced data. The moment a sponsored segment starts, we fast-forward past it. Works on intros, outros, and self-promos too.",
    pro: true,
    preview: <PreviewSponsor />,
  },
  {
    id: "clickbait",
    num: "08",
    icon: "alert",
    title: "Clickbait warnings",
    tag: "TRUTH IN TITLES",
    heading: "See the real title before you click.",
    body: "AI flags clickbait thumbnails and titles, and offers a plain-language replacement describing what the video actually covers.",
    pro: true,
    preview: <PreviewClickbait />,
  },
];

function PreviewHome() {
  return (
    <div className="pv-home">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text)",
          fontWeight: 500,
        }}
      >
        <span
          className="brand-mark"
          style={{ width: 22, height: 22, borderRadius: 6 }}
        >
          <Icon name="mark" size={12} stroke={2.2} />
        </span>
        <span style={{ fontSize: 14 }}>YouTube ForYou</span>
      </div>
      <div className="big-search">
        <Icon name="search" size={14} />
        <span>What did you come here to watch?</span>
        <span className="cursor" />
      </div>
      <div className="hint">no feed · no shorts · no traps</div>
    </div>
  );
}

function PreviewShorts() {
  return (
    <div className="pv-shorts">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="sh"
          style={{ ["--i" as string]: i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function PreviewPuzzle() {
  return (
    <div className="pv-puzzle">
      <div className="q">Solve to continue:  27 + 34 = ?</div>
      <div className="input-row">
        <div className="input">61</div>
        <div className="submit">Continue</div>
      </div>
      <div className="note">enough friction to break the reflex</div>
    </div>
  );
}

function PreviewComments() {
  return (
    <div className="pv-comments">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="cmt"
          style={{ ["--i" as string]: i } as React.CSSProperties}
        >
          <div className="av" />
          <div className="txt" />
        </div>
      ))}
    </div>
  );
}

function PreviewSidebar() {
  return (
    <div className="pv-sidebar">
      <div className="main-player">◎ main player</div>
      <div className="rec">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="item"
            style={{ ["--i" as string]: i } as React.CSSProperties}
          >
            <div className="thumb" />
            <div className="txt" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSchedule() {
  return (
    <div className="pv-schedule">
      <div className="row on">
        <span className="time">Mon–Fri 9–17</span>
        <span className="lbl">All blockers on</span>
        <span className="toggle on" />
      </div>
      <div className="row">
        <span className="time">Evenings</span>
        <span className="lbl">Shorts blocker only</span>
        <span className="toggle on" />
      </div>
      <div className="row">
        <span className="time">Weekends</span>
        <span className="lbl">Nothing blocked</span>
        <span className="toggle" />
      </div>
    </div>
  );
}

function PreviewSponsor() {
  return (
    <div className="pv-ads">
      <div className="player" />
      <div className="timer">
        <span>04:12 / 18:30</span>
        <span>
          <span className="num">SKIPPING SPONSOR…</span>
        </span>
      </div>
    </div>
  );
}

function PreviewClickbait() {
  return (
    <div className="pv-clickbait">
      <div className="video">
        <div className="thumb" />
        <div className="titles">
          <div className="orig">YOU WON&apos;T BELIEVE WHAT HAPPENED NEXT!!!</div>
          <div className="real">Dog catches a frisbee in the park.</div>
          <div className="warn">
            <Icon name="alert" size={10} /> Clickbait detected
          </div>
        </div>
      </div>
    </div>
  );
}
