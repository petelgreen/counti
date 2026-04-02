import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const calorie_goal = parseInt(body.calorie_goal, 10);
  if (!calorie_goal || calorie_goal < 1) {
    return NextResponse.json({ error: "Invalid calorie goal" }, { status: 400 });
  }
  await saveSettings({ calorie_goal });
  return NextResponse.json({ ok: true });
}
