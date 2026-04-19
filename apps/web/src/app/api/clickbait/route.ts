import { NextResponse } from "next/server";
import { requireExtensionUser } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { classifyClickbait } from "@/lib/gemini";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DAILY_QUOTA = 200; // per-user, per-day
const FEATURE = "clickbait";

export async function POST(request: Request) {
  if (process.env.AI_FEATURES_ENABLED === "false") {
    return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
  }

  const user = await requireExtensionUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { videoId?: string; title?: string; channelName?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const videoId = (body.videoId ?? "").trim();
  const title = (body.title ?? "").trim();
  const channelName = body.channelName?.trim();

  if (!videoId || !title) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (title.length > 500 || videoId.length > 32) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  const service = createServiceClient();

  // 1. Cache check.
  const { data: cached } = await service
    .from("clickbait_cache")
    .select("verdict, score, genuine_title, reasoning, created_at")
    .eq("video_id", videoId)
    .maybeSingle();

  if (cached && Date.now() - new Date(cached.created_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({
      verdict: cached.verdict,
      score: cached.score,
      genuineTitle: cached.genuine_title,
      reasoning: cached.reasoning,
      cached: true,
    });
  }

  // 2. Quota check.
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await service
    .from("ai_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("date", today)
    .eq("feature", FEATURE)
    .maybeSingle();

  if ((usage?.count ?? 0) >= DAILY_QUOTA) {
    return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
  }

  // 3. Classify via Gemini.
  let verdict;
  try {
    verdict = await classifyClickbait(title, channelName);
  } catch (err) {
    console.error("gemini classify failed", err);
    return NextResponse.json({ error: "classifier_failed" }, { status: 502 });
  }

  // 4. Write cache.
  await service.from("clickbait_cache").upsert(
    {
      video_id: videoId,
      verdict: verdict.verdict,
      score: verdict.score,
      genuine_title: verdict.genuineTitle,
      reasoning: verdict.reasoning,
      created_at: new Date().toISOString(),
    },
    { onConflict: "video_id" },
  );

  // 5. Increment quota (atomic upsert).
  await service.from("ai_usage").upsert(
    {
      user_id: user.id,
      date: today,
      feature: FEATURE,
      count: (usage?.count ?? 0) + 1,
    },
    { onConflict: "user_id,date,feature" },
  );

  return NextResponse.json({ ...verdict, cached: false });
}
