import { NextRequest, NextResponse } from "next/server";
import { updateSavedMeal, deleteSavedMeal } from "@/lib/db";
import { auth } from "@/auth";
import type { SavedMeal } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meal: SavedMeal = await req.json();
  await updateSavedMeal({ ...meal, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteSavedMeal(id);
  return NextResponse.json({ ok: true });
}
