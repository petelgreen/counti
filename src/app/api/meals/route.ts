import { NextRequest, NextResponse } from "next/server";
import { getMealsForDay, getMealsForDateRange, saveMeal } from "@/lib/db";
import type { MealEntry } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");
  const dateParam = searchParams.get("date");

  if (fromParam && toParam) {
    const meals = await getMealsForDateRange(parseInt(fromParam, 10), parseInt(toParam, 10));
    return NextResponse.json(meals);
  }

  const date = dateParam ? parseInt(dateParam, 10) : Date.now();
  return NextResponse.json(await getMealsForDay(date));
}

export async function POST(req: NextRequest) {
  const entry: MealEntry = await req.json();
  await saveMeal(entry);
  return NextResponse.json({ ok: true });
}
