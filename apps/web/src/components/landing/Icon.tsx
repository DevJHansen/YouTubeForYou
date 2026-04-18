type IconName =
  | "play"
  | "shorts"
  | "sponsor"
  | "comment"
  | "sidebar"
  | "translate"
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
  | "alert";

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
  const common = {
    width: size,
    height: size,
    strokeWidth: stroke,
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "play":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
          <path d="M10 8l6 4-6 4z" fill="#0b0b0c" stroke="none" />
        </svg>
      );
    case "mark":
      // ForYou wordmark: rounded play triangle inside rounded square (logo used in brand-mark).
      return (
        <svg viewBox="0 0 24 24" {...common} strokeWidth={2}>
          <path d="M9 7.5v9l7-4.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "shorts":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M8 4h8l4 4v12a0 0 0 0 1 0 0H4V8z" />
          <path d="M10 11l5 3-5 3z" />
        </svg>
      );
    case "sponsor":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M9 12h2M13 12h2M17 12h0" />
          <path d="M6 9l-2 3 2 3" />
        </svg>
      );
    case "comment":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
        </svg>
      );
    case "sidebar":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M15 4v16" />
        </svg>
      );
    case "translate":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 5h10M9 3v2M6 5s0 5 5 8M14 13s-3 1-5 0" />
          <path d="M11 20l4-9 4 9M12.5 17h5" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "autoplay":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3a9 9 0 1 1-9 9" />
          <path d="M3 3v6h6" />
          <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chrome":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M21 12h-9M7.5 6.5l4.5 5.5M7.5 17.5L12 12" />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" {...common} strokeWidth={1.8}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "puzzle":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 10h3a2 2 0 1 0 4 0h3a2 2 0 1 1 0 4v3a2 2 0 1 0-4 0H7a2 2 0 1 1 0-4V10z" />
        </svg>
      );
    case "schedule":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "alert":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l10 18H2z" />
          <path d="M12 10v4M12 17h0" />
        </svg>
      );
    default:
      return null;
  }
}
