import {
  ArrowRight,
  CalendarClock,
  ChartBar,
  Check,
  Clock,
  Eye,
  Home,
  Lock,
  MessageSquare,
  PanelRight,
  Puzzle,
  Search,
  SkipForward,
  Timer,
  TriangleAlert,
  type LucideProps,
} from "lucide-react";

export type IconName =
  | "play"
  | "shorts"
  | "sponsor"
  | "comment"
  | "sidebar"
  | "home"
  | "autoplay"
  | "chrome"
  | "arrow"
  | "check"
  | "lock"
  | "search"
  | "mark"
  | "puzzle"
  | "schedule"
  | "clock"
  | "chart"
  | "eye"
  | "alert"
  | "budget";

const LUCIDE: Partial<Record<IconName, React.ComponentType<LucideProps>>> = {
  arrow: ArrowRight,
  search: Search,
  lock: Lock,
  check: Check,
  home: Home,
  comment: MessageSquare,
  sidebar: PanelRight,
  puzzle: Puzzle,
  schedule: CalendarClock,
  clock: Clock,
  chart: ChartBar,
  eye: Eye,
  alert: TriangleAlert,
  sponsor: SkipForward,
  budget: Timer,
};

export function Icon({
  name,
  size = 16,
  stroke = 1.6,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  if (name === "mark") {
    return (
      <svg
        viewBox="0 0 128 128"
        width={size}
        height={size}
        aria-hidden="true"
        className={className}
      >
        <circle cx="64" cy="64" r="58" fill="none" stroke="#FF0000" strokeWidth="6" />
        <circle cx="64" cy="64" r="46" fill="#FF0000" />
        <path d="M52 42 L52 86 L88 64 Z" fill="white" />
      </svg>
    );
  }

  if (name === "chrome") {
    // Google Chrome brand logo — full colour, recognisable at small sizes.
    return (
      <svg
        viewBox="0 0 190.5 190.5"
        width={size}
        height={size}
        aria-hidden="true"
        className={className}
      >
        <path
          fill="#fff"
          d="M95.25 142.875c26.302 0 47.625-21.324 47.625-47.625S121.552 47.625 95.25 47.625 47.625 68.948 47.625 95.25s21.324 47.625 47.625 47.625z"
        />
        <path
          fill="#229342"
          d="M54.005 71.44 28.34 27A95.22 95.22 0 0 0 .534 108.563l51.48-8.886C49.762 91.147 50.5 80.57 54.005 71.44z"
        />
        <path
          fill="#fbc116"
          d="M95.25 142.875a47.54 47.54 0 0 0 40.813-23.179L83.86 137.06a47.603 47.603 0 0 1-9.44-12.067L44.5 76.565A47.625 47.625 0 0 0 95.25 142.875z"
        />
        <path
          fill="#1a73e8"
          d="M135.982 119.694a47.625 47.625 0 0 0-.054-48.953l36.82-5.86A95.264 95.264 0 0 1 136 168l-.018-48.306z"
        />
        <path
          fill="#e33b2e"
          d="M142.875 95.25a47.625 47.625 0 0 0-95.25 0l47.625-47.625h77.247A95.249 95.249 0 0 0 95.25 0v47.625z"
        />
        <circle cx="95.25" cy="95.25" r="38" fill="#1a73e8" />
      </svg>
    );
  }

  if (name === "shorts") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8l6 4-6 4z" fill="#0b0b0c" />
      </svg>
    );
  }

  if (name === "autoplay") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 3a9 9 0 1 1-9 9" />
        <path d="M3 3v6h6" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  const LucideIcon = LUCIDE[name];
  if (!LucideIcon) return null;
  return (
    <LucideIcon
      size={size}
      strokeWidth={stroke}
      className={className}
      aria-hidden
    />
  );
}
