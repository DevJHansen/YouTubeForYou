import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("Missing GEMINI_API_KEY");
  return k;
}

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_client) _client = new GoogleGenAI({ apiKey: apiKey() });
  return _client;
}

export type ClickbaitVerdict = {
  verdict: "clickbait" | "ok" | "unknown";
  score: number; // 0-1
  genuineTitle: string | null;
  reasoning: string | null;
};

export async function classifyClickbait(
  title: string,
  channelName?: string,
): Promise<ClickbaitVerdict> {
  const prompt = [
    "You are classifying a YouTube video title as clickbait or not.",
    "",
    'A title is "clickbait" when it: uses ALL-CAPS or excessive punctuation, makes a sensational or false promise, hides the actual topic, uses manipulative phrasing like "YOU WON\'T BELIEVE" or "SHOCKING", or overpromises in a way the video likely cannot deliver.',
    'A title is "ok" when it clearly describes the video topic without manipulation, even if it is descriptive or informal.',
    'Use "unknown" only if the title is empty, gibberish, or in a language you cannot parse.',
    "",
    "If you mark it clickbait, provide a genuineTitle: a neutral 1-line rewrite that honestly describes the topic as you understand it. This can be in any language — match the original.",
    "Keep reasoning to one sentence.",
    "",
    `Channel: ${channelName ?? "(unknown)"}`,
    `Title: ${title}`,
  ].join("\n");

  const res = await client().models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["clickbait", "ok", "unknown"] },
          score: { type: Type.NUMBER },
          genuineTitle: { type: Type.STRING, nullable: true },
          reasoning: { type: Type.STRING, nullable: true },
        },
        required: ["verdict", "score"],
        propertyOrdering: ["verdict", "score", "genuineTitle", "reasoning"],
      },
      temperature: 0.2,
      maxOutputTokens: 300,
    },
  });

  const text = res.text ?? "{}";
  let parsed: Partial<ClickbaitVerdict> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    return { verdict: "unknown", score: 0, genuineTitle: null, reasoning: null };
  }

  const verdict =
    parsed.verdict === "clickbait" || parsed.verdict === "ok" || parsed.verdict === "unknown"
      ? parsed.verdict
      : "unknown";

  return {
    verdict,
    score: typeof parsed.score === "number" ? Math.max(0, Math.min(1, parsed.score)) : 0,
    genuineTitle: parsed.genuineTitle ?? null,
    reasoning: parsed.reasoning ?? null,
  };
}
