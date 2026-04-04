import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { mealName } = await req.json() as { mealName: string };
  if (!mealName) return NextResponse.json({ error: "missing mealName" }, { status: 400 });

  // Translate meal name to a simple English search keyword
  let keyword = "food";
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Translate this food name to a simple English keyword for image search (1-3 words, no punctuation): "${mealName}". Reply only with the keyword.`,
      }],
      max_tokens: 20,
      temperature: 0,
    });
    keyword = completion.choices[0]?.message?.content?.trim().replace(/[^a-zA-Z0-9 ]/g, "") || "food";
  } catch {
    // fallback to generic food
  }

  // Fetch from Unsplash Source (no API key needed)
  const url = `https://source.unsplash.com/400x300/?${encodeURIComponent("food " + keyword)}`;

  try {
    const imgRes = await fetch(url, { redirect: "follow" });
    if (!imgRes.ok) return NextResponse.json({ error: "image fetch failed" }, { status: 502 });

    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ imageBase64: dataUrl });
  } catch {
    return NextResponse.json({ error: "image fetch failed" }, { status: 502 });
  }
}
