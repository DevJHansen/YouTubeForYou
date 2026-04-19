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
import { SiGooglechrome } from "react-icons/si";

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
    return (
      <SiGooglechrome
        size={size}
        className={className}
        aria-hidden
      />
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
