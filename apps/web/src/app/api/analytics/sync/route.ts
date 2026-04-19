import { NextResponse } from "next/server";
import { requireExtensionUser } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";

type Deltas = {
  shortsBlocked?: number;
  secondsWatchedLong?: number;
  secondsWatchedShorts?: number;
  sponsorsSkipped?: number;
  clickbaitFlagged?: number;
};

const CAP = 60 * 60 * 24; // per-day per-counter sanity cap (1 day of seconds)

function clamp(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 0;
  if (v < 0) return 0;
  if (v > CAP) return CAP;
  return v;
}

export async function POST(request: Request) {
  const user = await requireExtensionUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { date?: string; deltas?: Deltas } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const date = body.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const d = body.deltas ?? {};
  const shortsBlocked = clamp(d.shortsBlocked);
  const secondsWatchedLong = clamp(d.secondsWatchedLong);
  const secondsWatchedShorts = clamp(d.secondsWatchedShorts);
  const sponsorsSkipped = clamp(d.sponsorsSkipped);
  const clickbaitFlagged = clamp(d.clickbaitFlagged);

  if (
    shortsBlocked === 0 &&
    secondsWatchedLong === 0 &&
    secondsWatchedShorts === 0 &&
    sponsorsSkipped === 0 &&
    clickbaitFlagged === 0
  ) {
    return NextResponse.json({ ok: true });
  }

  const service = createServiceClient();
  const { data: existing } = await service
    .from("analytics_daily")
    .select("shorts_blocked, seconds_watched_long, seconds_watched_shorts, sponsors_skipped, clickbait_flagged")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  const next = {
    user_id: user.id,
    date,
    shorts_blocked: (existing?.shorts_blocked ?? 0) + shortsBlocked,
    seconds_watched_long: (existing?.seconds_watched_long ?? 0) + secondsWatchedLong,
    seconds_watched_shorts: (existing?.seconds_watched_shorts ?? 0) + secondsWatchedShorts,
    sponsors_skipped: (existing?.sponsors_skipped ?? 0) + sponsorsSkipped,
    clickbait_flagged: (existing?.clickbait_flagged ?? 0) + clickbaitFlagged,
    updated_at: new Date().toISOString(),
  };

  const { error } = await service
    .from("analytics_daily")
    .upsert(next, { onConflict: "user_id,date" });

  if (error) {
    console.error("analytics upsert failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
