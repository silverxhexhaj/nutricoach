import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import type { ProgramItemType } from "@/types/program";

const VALID_TYPES: ProgramItemType[] = ["workout", "exercise", "meal", "text"];

function buildSystemPrompt(type: ProgramItemType): string {
  const base =
    "You are an expert fitness and nutrition coach assistant. Return ONLY valid JSON — no markdown fences, no explanation, just raw JSON matching the exact structure specified.";

  switch (type) {
    case "workout":
      return `${base}

Generate a workout library item. Return exactly:
{
  "title": "string (concise workout name)",
  "content": {
    "exercises": [
      { "name": "string", "sets": "string (e.g. '3')", "reps": "string (e.g. '8-12')", "rest": "string (e.g. '60s')" }
    ],
    "notes": "string (optional coaching notes)"
  }
}

Rules: include 4-8 exercises appropriate to the request; sets/reps/rest as strings; notes are optional but helpful.`;

    case "exercise":
      return `${base}

Generate a single exercise library item. Return exactly:
{
  "title": "string (exercise name)",
  "content": {
    "sets": "string (e.g. '3')",
    "reps": "string (e.g. '8-12')",
    "weight": "string (e.g. 'Bodyweight' or '60kg' or 'Moderate')",
    "rest_seconds": "string (e.g. '90')",
    "notes": "string (form cues and coaching tips)"
  }
}

Rules: all fields as strings; notes should include form cues and any coaching tips.`;

    case "meal":
      return `${base}

Generate a meal library item. Return exactly:
{
  "title": "string (meal name)",
  "content": {
    "meal_type": "string (one of: Breakfast, Lunch, Dinner, Snack, Pre-workout, Post-workout)",
    "foods": [
      { "name": "string", "amount": "string (e.g. '150')", "unit": "string (e.g. 'g' or 'ml' or 'cup')", "calories": "string (e.g. '250')", "protein": "string (e.g. '30')" }
    ],
    "notes": "string (optional prep notes)"
  }
}

Rules: include 3-8 food items with realistic portions and accurate macro estimates; all values as strings.`;

    case "text":
      return `${base}

Generate a text/notes library item. Return exactly:
{
  "title": "string (concise title)",
  "content": {
    "body": "string (the full text content, can include line breaks)"
  }
}

Rules: body should be well-structured, practical content (tips, protocols, guides, instructions); use line breaks for readability.`;

    default:
      return base;
  }
}

function parseGeneratedContent(raw: string): { title: string; content: Record<string, unknown> } {
  let cleaned = raw.trim();
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as { title: string; content: Record<string, unknown> };
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as { title: string; content: Record<string, unknown> };
    }
    throw new Error("Could not parse AI response. Please try again.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return apiError(500, "ANTHROPIC_API_KEY is not configured", "CONFIG_ERROR");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!coach) return apiError(404, "Coach not found", "COACH_NOT_FOUND");

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipPart = forwardedFor?.split(",")[0]?.trim() || "anonymous";
    const rateKey = `library-gen:user:${user.id}:ip:${ipPart}`;

    const hourly = checkRateLimit(rateKey, 10, 60 * 60 * 1000);
    if (!hourly.allowed) {
      return NextResponse.json(
        { error: "Too many generation requests. Please try again later.", code: "RATE_LIMIT_HOURLY" },
        { status: 429, headers: { "Retry-After": String(hourly.retryAfterSeconds) } }
      );
    }

    const daily = checkRateLimit(rateKey, 30, 24 * 60 * 60 * 1000);
    if (!daily.allowed) {
      return NextResponse.json(
        { error: "Daily generation limit reached. Please try again tomorrow.", code: "RATE_LIMIT_DAILY" },
        { status: 429, headers: { "Retry-After": String(daily.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { type, prompt } = body as { type?: string; prompt?: string };

    if (!type || !VALID_TYPES.includes(type as ProgramItemType)) {
      return apiError(400, `type must be one of: ${VALID_TYPES.join(", ")}`, "VALIDATION_ERROR");
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return apiError(400, "prompt is required (at least 3 characters)", "VALIDATION_ERROR");
    }

    const itemType = type as ProgramItemType;
    const anthropic = new Anthropic({ apiKey, maxRetries: 3 });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: buildSystemPrompt(itemType),
      messages: [{ role: "user", content: prompt.trim() }],
    });

    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const generated = parseGeneratedContent(textContent);

    if (!generated.title || typeof generated.title !== "string") {
      return apiError(500, "AI returned invalid content structure. Please try again.", "GENERATION_FAILED");
    }
    if (!generated.content || typeof generated.content !== "object") {
      return apiError(500, "AI returned invalid content structure. Please try again.", "GENERATION_FAILED");
    }

    return NextResponse.json({ title: generated.title, content: generated.content });
  } catch (err) {
    console.error("Library generate error:", err);
    const status = (err as { status?: number })?.status;
    if (status === 529 || status === 429) {
      return apiError(503, "AI service is temporarily busy. Please try again in a moment.", "AI_OVERLOADED");
    }
    return apiError(500, "Generation failed. Please try again.", "GENERATION_FAILED");
  }
}
