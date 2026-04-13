import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnalyzeResponse, ClarifyQuestion, ClarifyAnswer } from "@/lib/types";

export const runtime = "nodejs";

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PHASE1_SYSTEM = `אתה מנתח תזונה. המשתמש תיאר ארוחה בעברית.

עליך לבצע שני דברים:
1. לאמוד את הערכים התזונתיים לפי ברירת מחדל סבירה ("initial_estimate").
2. לייצר עד 3 שאלות הבהרה שכל אחת מהן תשנה את האומדן ב-80 קק"ל לפחות.

סוגי שאלות:

סוג "quantity" — השתמש כשנשאלים על רכיב מוסף שכמותו משנה את הקלוריות (שמנים, רטבים, חמאה, סוכר, דבש, זרעים, גבינה מגוררת מעל, שמנת, אבוקדו):
  - עדיפות גבוהה לסלטים: שמן/רוטב, אבוקדו, גבינה — לפני אגוזים או זרעים
  - text: שאלה בעברית פשוטה ("כמה שמן זית הוספת?")
  - ingredient: שם הרכיב בעברית
  - unit: יחידת מידה ריאלית (כף / כפית / מ״ל / גרם)
  - default_amount: כמות ממוצעת טיפוסית
  - min_amount: 0 (תמיד)
  - max_amount: 3–4 פעמים הממוצע
  - step: 0.5 לכף/כפית, 5 למ״ל/גרם
  - cal_per_unit, protein_per_unit, carbs_per_unit, fat_per_unit: ערכים לכל יחידה אחת

סוג "choice" — השתמש כשנשאלים על זהות הרכיב ("איזה גבינה?", "איזה רוטב?"):
  - text: שאלה בעברית פשוטה
  - options: מערך של 3–5 אפשרויות. האפשרות הראשונה תמיד: { "label": "לא הוספתי", "cal_delta": 0 }
  - שאר האפשרויות: { "label": שם, "cal_delta": הפרש קלורי ריאלי }

סוג "yesno" — לכל שאר השאלות שניתן לענות עליהן כן/לא.

כללים לשאלות:
- שאל רק אם התשובה תשנה את הקלוריות ב-80+ קק"ל.
- שאל מהדבר שהשפעתו הגדולה ביותר ראשון.
- לסלטים: שאל תחילה על רוטב/שמן ואחר כך על אבוקדו — אגוזים ממוצגים רק אם שניהם כבר ידועים.
- אל תשאל על דברים שכבר צוינו בתיאור המשתמש.
- אם המשתמש ציין מידה מדויקת לרכיב כלשהו (לדוגמה: "200 גרם", "2 כפות", "100 מ״ל", "חצי כוס") — אל תשאל שאלת quantity על אותו רכיב. המידה כבר ידועה.
- אם אין שאלות כאלה (הארוחה ברורה), החזר questions: [].
- אל תשאל יותר מ-3 שאלות בשום מקרה.

ענה ONLY בJSON הבא — ללא markdown, ללא טקסט נוסף:
{
  "questions": [
    // yesno:
    { "type": "yesno", "id": string, "text": string, "impact_kcal": number },
    // quantity:
    { "type": "quantity", "id": string, "text": string, "ingredient": string, "unit": string, "default_amount": number, "min_amount": number, "max_amount": number, "step": number, "cal_per_unit": number, "protein_per_unit": number, "carbs_per_unit": number, "fat_per_unit": number, "impact_kcal": number },
    // choice:
    { "type": "choice", "id": string, "text": string, "options": [{ "label": string, "cal_delta": number }], "impact_kcal": number }
  ],
  "initial_estimate": {
    "items": [{ "name": string, "quantity": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }],
    "confidence": "high" | "medium" | "low",
    "assumptions": string
  }
}

כללים לאומדן:
- שמות פריטים בעברית.
- quantity (אופציונלי): כמות מילולית כמו "150 גרם", "1 כף", "2 כוסות".
- assumptions בעברית — משפט אחד המתאר הנחות ברירת מחדל.
- confidence = "low" אם יצרת שאלות. confidence = "high" אם questions ריק.`;

const PHASE2_SYSTEM = `אתה מנתח תזונה. המשתמש תיאר ארוחה בעברית וענה על שאלות הבהרה.

קבע את הערכים התזונתיים הסופיים בהתבסס על כל המידע.

ענה ONLY בJSON הבא — ללא markdown, ללא טקסט נוסף:
{
  "items": [{ "name": string, "quantity": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }],
  "confidence": "high" | "medium" | "low",
  "assumptions": string
}

כללים:
- שמות פריטים בעברית.
- quantity (אופציונלי): כמות מילולית כמו "150 גרם", "1 כף", "2 כוסות".
- assumptions: משפט אחד בעברית המסכם מה הנחת על בסיס התשובות.
- confidence = "high" אם כל השאלות ענו. "medium" אם חלק דולגו. "low" אם הכל דולג.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json() as {
    text: string;
    image_base64?: string | null;
    answers?: ClarifyAnswer[];
  };

  const { image_base64, answers } = body;
  const text = body.text?.trim() || (image_base64 ? "נתח את הארוחה בתמונה" : "");

  if (!text) {
    return NextResponse.json({ error: "text or image is required" }, { status: 400 });
  }

  // ── Phase 2: finalize with answers ──────────────────────────────────────────
  if (answers && answers.length > 0) {
    const qaBlock = answers.map(a => {
      let label: string;
      if (a.answer === "yes") label = "כן";
      else if (a.answer === "no") label = "לא";
      else if (a.answer === "skip") label = "דלגתי";
      else label = a.answer; // quantity number or choice label — already descriptive
      return `שאלה: ${a.question_text} → תשובה: ${label}`;
    }).join("\n");

    const userContent = `תיאור המשתמש: ${text}\n\nשאלות ותשובות:\n${qaBlock}`;

    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: PHASE2_SYSTEM },
          { role: "user", content: userContent },
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
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
      const result: AnalyzeResponse = { items, confidence: data.confidence ?? "medium", assumptions: data.assumptions ?? "", totals };
      return NextResponse.json({ phase: "final", result });
    } catch {
      return NextResponse.json({ error: "Phase 2 AI call failed" }, { status: 500 });
    }
  }

  // ── Phase 1: generate questions + initial estimate ───────────────────────────
  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

  if (image_base64) {
    userContent.push({
      type: "image_url",
      image_url: { url: image_base64, detail: "low" },
    });
  }

  userContent.push({ type: "text", text: text.trim() });

  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PHASE1_SYSTEM },
        { role: "user", content: userContent },
      ],
      max_tokens: 800,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(cleaned);

    const VALID_TYPES = new Set(["yesno", "quantity", "choice"]);
    const questions: ClarifyQuestion[] = (data.questions ?? []).filter(
      (q: any) => q.impact_kcal >= 80 && VALID_TYPES.has(q.type)
    ).slice(0, 3);

    const est = data.initial_estimate ?? {};
    const items = est.items ?? [];
    const totals = items.reduce(
      (acc: any, item: any) => ({
        calories: acc.calories + (item.calories ?? 0),
        protein_g: acc.protein_g + (item.protein_g ?? 0),
        carbs_g: acc.carbs_g + (item.carbs_g ?? 0),
        fat_g: acc.fat_g + (item.fat_g ?? 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
    const initial_estimate: AnalyzeResponse = {
      items,
      confidence: est.confidence ?? "medium",
      assumptions: est.assumptions ?? "",
      totals,
    };

    return NextResponse.json({ phase: "questions", questions, initial_estimate });
  } catch {
    return NextResponse.json({ error: "Phase 1 AI call failed" }, { status: 500 });
  }
}
