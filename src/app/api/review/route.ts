import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { MealItem } from "@/lib/types";

export const runtime = "nodejs";

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { items, timestamp } = await req.json() as { items: MealItem[]; timestamp?: number };

  const hour = new Date(timestamp ?? Date.now()).getHours();
  const timeOfDay =
    hour < 10 ? "בוקר" :
    hour < 13 ? "אמצע הבוקר" :
    hour < 15 ? "צהריים" :
    hour < 18 ? "אחה\"צ" :
    hour < 21 ? "ערב" : "לילה";

  const mealDesc = items.map(i =>
    `${i.name}: ${i.calories} קק"ל, חלבון ${i.protein_g}g, פחמימות ${i.carbs_g}g, שומן ${i.fat_g}g`
  ).join("\n");

  const prompt = `אתה דיאטן/ית מקצועי/ת. המשתמש אכל את הארוחה הבאה בשעת ${timeOfDay}:

${mealDesc}

ענה ONLY בJSON הבא (ללא markdown, ללא טקסט נוסף):
{
  "rating": 1-5,
  "summary": "משפט קצר בעברית על הארוחה",
  "tip": "טיפ קצר בעברית לשיפור",
  "improved": [
    { "name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
  ]
}

improved = גרסה משופרת של הארוחה (הורד קלוריות / הוסף חלבון). שמור על פריטים דומים אך בריאים יותר.`;

  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "review failed" }, { status: 500 });
  }
}
