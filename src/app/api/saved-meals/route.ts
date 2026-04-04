import { NextRequest, NextResponse } from "next/server";
import { getSavedMeals, createSavedMeal } from "@/lib/db";
import { auth } from "@/auth";
import type { SavedMeal } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getSavedMeals(session.user.id));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meal: SavedMeal = await req.json();
  await createSavedMeal(session.user.id, meal);
  return NextResponse.json({ ok: true }, { status: 201 });
}
