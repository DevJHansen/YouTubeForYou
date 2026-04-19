import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { AuthShell } from "../../auth/AuthShell";

type DailyRow = {
  date: string;
  shorts_blocked: number;
  seconds_watched_long: number;
  seconds_watched_shorts: number;
  sponsors_skipped: number;
  clickbait_flagged: number;
};

const DAYS = 30;
const SHORTS_STREAK_LIMIT_SECONDS = 5 * 60;

// YYYY-MM-DD in UTC — matches how Postgres `date` values come back over the wire.
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildWindow(today: Date): string[] {
  const dates: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(toIsoDate(d));
  }
  return dates;
}

function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  // "12.5h" style — one decimal, trimmed trailing zero.
  return `${hours.toFixed(1)}h`;
}

function formatDayLabel(iso: string): string {
  // iso is YYYY-MM-DD — split to avoid timezone surprises with `new Date(iso)`.
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

function computeStreak(rows: DailyRow[]): number {
  // Walk from most-recent day backwards; count consecutive days under the shorts limit.
  let streak = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].seconds_watched_shorts < SHORTS_STREAK_LIMIT_SECONDS) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?next=/account/analytics");
  if (session.plan !== "pro") redirect("/upgrade");

  const today = new Date();
  const window = buildWindow(today);
  const startIso = window[0];
  const endIso = window[window.length - 1];

  const service = createServiceClient();
  const { data } = await service
    .from("analytics_daily")
    .select(
      "date, shorts_blocked, seconds_watched_long, seconds_watched_shorts, sponsors_skipped, clickbait_flagged",
    )
    .eq("user_id", session.userId)
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: true });

  const byDate = new Map<string, DailyRow>();
  for (const r of (data ?? []) as DailyRow[]) {
    byDate.set(r.date, r);
  }

  // Fill missing days with zeros so the chart is gapless.
  const rows: DailyRow[] = window.map(
    (date) =>
      byDate.get(date) ?? {
        date,
        shorts_blocked: 0,
        seconds_watched_long: 0,
        seconds_watched_shorts: 0,
        sponsors_skipped: 0,
        clickbait_flagged: 0,
      },
  );

  const hasData = rows.some(
    (r) =>
      r.shorts_blocked > 0 ||
      r.seconds_watched_long > 0 ||
      r.seconds_watched_shorts > 0 ||
      r.sponsors_skipped > 0 ||
      r.clickbait_flagged > 0,
  );

  if (!hasData) {
    return (
      <AuthShell title="Analytics" subtitle={session.email}>
        <p className="auth-note">
          Analytics will appear here after your extension syncs. Make sure
          Analytics is toggled on in the extension popup.
        </p>
        <div className="auth-actions">
          <Link href="/account" className="btn-ghost auth-submit">
            Back to account
          </Link>
        </div>
      </AuthShell>
    );
  }

  const totalShortsBlocked = rows.reduce((s, r) => s + r.shorts_blocked, 0);
  const totalSponsorsSkipped = rows.reduce((s, r) => s + r.sponsors_skipped, 0);
  const totalSecondsLong = rows.reduce((s, r) => s + r.seconds_watched_long, 0);
  const totalSecondsShorts = rows.reduce(
    (s, r) => s + r.seconds_watched_shorts,
    0,
  );
  const totalSecondsWatched = totalSecondsLong + totalSecondsShorts;
  const streak = computeStreak(rows);

  // Chart geometry.
  // 30 bars across 300 viewBox units = 10u per slot, 9u bar + 1u gap.
  // preserveAspectRatio=none on the SVG stretches bars to fill width, so bars
  // end up ~8–10px wide at typical card widths without us doing layout math.
  const CHART_W = 300;
  const CHART_H = 100;
  const SLOT_W = CHART_W / DAYS; // 10
  const BAR_W = SLOT_W - 1;
  const maxSecondsInDay = rows.reduce(
    (max, r) => Math.max(max, r.seconds_watched_long + r.seconds_watched_shorts),
    0,
  );
  // Avoid div-by-zero when there's data but all watch time is zero (e.g. only blocks).
  const scale = maxSecondsInDay > 0 ? CHART_H / maxSecondsInDay : 0;

  // Long-form vs Shorts ratio for the donut. Guard against zero.
  const ratioTotal = totalSecondsLong + totalSecondsShorts;
  const longPct = ratioTotal > 0 ? (totalSecondsLong / ratioTotal) * 100 : 0;
  const shortsPct = ratioTotal > 0 ? 100 - longPct : 0;

  // Donut geometry — a single ring, colored segments via stroke-dasharray.
  const DONUT_SIZE = 120;
  const DONUT_R = 48;
  const CIRC = 2 * Math.PI * DONUT_R;
  const longDash = (longPct / 100) * CIRC;
  const shortsDash = (shortsPct / 100) * CIRC;

  return (
    <AuthShell title="Analytics" subtitle={session.email}>
      <p className="auth-sub analytics-period">Last 30 days</p>

      <div className="analytics-grid">
        <div className="stat-tile">
          <span className="stat-tile__label">Shorts blocked</span>
          <strong className="stat-tile__value">
            {totalShortsBlocked.toLocaleString()}
          </strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__label">Hours watched</span>
          <strong className="stat-tile__value">
            {formatHours(totalSecondsWatched)}
          </strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__label">Sponsors skipped</span>
          <strong className="stat-tile__value">
            {totalSponsorsSkipped.toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="chart">
        <div className="chart__head">
          <span className="chart__title">Daily minutes watched</span>
          <span className="chart__legend">
            <span className="chart__legend-item">
              <span className="chart__swatch chart__swatch--long" />
              Long-form
            </span>
            <span className="chart__legend-item">
              <span className="chart__swatch chart__swatch--short" />
              Shorts
            </span>
          </span>
        </div>
        <svg
          className="chart__svg"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="30 day watch time, long-form versus shorts"
        >
          {rows.map((r, i) => {
            const longH = r.seconds_watched_long * scale;
            const shortH = r.seconds_watched_shorts * scale;
            const x = i * SLOT_W;
            // Shorts stacked on top of long so the accent-red sits above.
            const longY = CHART_H - longH;
            const shortY = CHART_H - longH - shortH;
            return (
              <g key={r.date}>
                {longH > 0 && (
                  <rect
                    className="chart-bar chart-bar__long"
                    x={x}
                    y={longY}
                    width={BAR_W}
                    height={longH}
                  />
                )}
                {shortH > 0 && (
                  <rect
                    className="chart-bar chart-bar__short"
                    x={x}
                    y={shortY}
                    width={BAR_W}
                    height={shortH}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {/* Axis labels in HTML so they don't stretch with preserveAspectRatio=none. */}
        <div className="chart__axis-row">
          {rows.map((r, i) => (
            <span
              key={`lbl-${r.date}`}
              className="chart__axis-lbl"
              aria-hidden={i % 7 !== 0}
            >
              {i % 7 === 0 ? formatDayLabel(r.date) : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="ratio">
        <div className="ratio__donut">
          <svg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} aria-hidden="true">
            {/* Rotate arcs -90° around the center so they start at 12 o'clock. */}
            <g
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
            >
              <circle
                className="ratio__track"
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={DONUT_R}
              />
              {ratioTotal > 0 && (
                <>
                  <circle
                    className="ratio__arc ratio__arc--long"
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    r={DONUT_R}
                    strokeDasharray={`${longDash} ${CIRC - longDash}`}
                  />
                  <circle
                    className="ratio__arc ratio__arc--short"
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    r={DONUT_R}
                    strokeDasharray={`${shortsDash} ${CIRC - shortsDash}`}
                    strokeDashoffset={-longDash}
                  />
                </>
              )}
            </g>
          </svg>
        </div>
        <div className="ratio__body">
          <span className="stat-tile__label">Long-form vs Shorts</span>
          <div className="ratio__row">
            <span className="ratio__dot ratio__dot--long" />
            <span className="ratio__lbl">Long-form</span>
            <span className="ratio__val">{longPct.toFixed(0)}%</span>
          </div>
          <div className="ratio__row">
            <span className="ratio__dot ratio__dot--short" />
            <span className="ratio__lbl">Shorts</span>
            <span className="ratio__val">{shortsPct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="stat-tile stat-tile--streak">
        <span className="stat-tile__label">Current streak</span>
        <strong className="stat-tile__value">
          {streak}
          <span className="stat-tile__unit">
            {streak === 1 ? "day" : "days"}
          </span>
        </strong>
        <span className="stat-tile__hint">
          Consecutive days with Shorts under 5 minutes
        </span>
      </div>

      <div className="auth-actions">
        <Link href="/account" className="btn-ghost auth-submit">
          Back to account
        </Link>
      </div>
    </AuthShell>
  );
}
