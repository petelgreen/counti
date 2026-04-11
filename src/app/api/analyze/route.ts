import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a nutrition estimator. The user will describe food they ate in Hebrew, optionally with an image.

Respond ONLY with a valid JSON object — no markdown, no prose, no code fences.

Schema:
{
  "items": [
    { "name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
  ],
  "confidence": "high" | "medium" | "low",
  "assumptions": string
}

Rules:
- The "name" field for each item MUST be in Hebrew.
- The "assumptions" field MUST be written in Hebrew.
- List each distinct food item separately.
- Estimate realistic portion sizes if not specified.
- confidence = "high" if the food is specific and common; "medium" if portions are guessed; "low" if the food is ambiguous or unusual.
- assumptions = one sentence in Hebrew describing what you assumed (portions, preparation method, etc.).
- All numeric values must be integers or decimals (no strings).`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  let text = "";
  let imageBase64: string | null = null;
  let imageMediaType: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    text = (formData.get("text") as string) ?? "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
      imageMediaType = imageFile.type || "image/jpeg";
    }
  } else {
    const body = await req.json();
    text = body.text ?? "";
  }

  if (!text.trim() && !imageBase64) {
    return NextResponse.json({ error: "Provide text or an image" }, { status: 400 });
  }

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

  if (imageBase64 && imageMediaType) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${imageMediaType};base64,${imageBase64}`, detail: "low" },
    });
  }

  userContent.push({
    type: "text",
    text: text.trim() || "הערך את הערכים התזונתיים של המזון שמוצג בתמונה.",
  });

  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: AnalyzeResponse;
    try {
      const data = JSON.parse(cleaned);
      const items = data.items ?? [];
      const totals = items.reduce(
        (acc: any, item: any) => ({
          calories: acc.calories + (item.calories ?? 0),
          protein_g: acc.protein_g + (item.protein_g ?? 0),
          carbs_g: acc.carbs_g + (item.carbs_g ?? 0),
          fat_g: acc.fat_g + (item.fat_g ?? 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      );
      parsed = { items, confidence: data.confidence ?? "medium", assumptions: data.assumptions ?? "", totals };
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "OpenAI call failed" }, { status: 500 });
  }
}
