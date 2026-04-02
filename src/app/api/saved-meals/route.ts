import { NextRequest, NextResponse } from "next/server";
import { getSavedMeals, createSavedMeal } from "@/lib/db";
import type { SavedMeal } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getSavedMeals());
}

export async function POST(req: NextRequest) {
  const meal: SavedMeal = await req.json();
  await createSavedMeal(meal);
  return NextResponse.json({ ok: true }, { status: 201 });
}
