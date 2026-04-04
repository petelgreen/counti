import { NextRequest, NextResponse } from "next/server";
import { getMealsForDay, getMealsForDateRange, saveMeal } from "@/lib/db";
import { auth } from "@/auth";
import type { MealEntry } from "@/lib/types";

export const runtime = "nodejs";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");
  const dateParam = searchParams.get("date");

  if (fromParam && toParam) {
    return NextResponse.json(await getMealsForDateRange(userId, parseInt(fromParam, 10), parseInt(toParam, 10)));
  }

  const date = dateParam ? parseInt(dateParam, 10) : Date.now();
  return NextResponse.json(await getMealsForDay(userId, date));
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entry: MealEntry = await req.json();
  await saveMeal({ ...entry, user_id: userId });
  return NextResponse.json({ ok: true });
}
