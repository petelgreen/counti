import { NextRequest, NextResponse } from "next/server";
import { deleteMeal, updateMeal } from "@/lib/db";
import type { MealEntry } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: MealEntry = await req.json();
  await updateMeal({ ...body, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteMeal(id);
  return NextResponse.json({ ok: true });
}
