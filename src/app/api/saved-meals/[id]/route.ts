import { NextRequest, NextResponse } from "next/server";
import { updateSavedMeal, deleteSavedMeal } from "@/lib/db";
import type { SavedMeal } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meal: SavedMeal = await req.json();
  await updateSavedMeal({ ...meal, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteSavedMeal(id);
  return NextResponse.json({ ok: true });
}
