import { NextRequest, NextResponse } from "next/server";
import { deleteMeal, updateMeal } from "@/lib/db";
import { auth } from "@/auth";
import type { MealEntry } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body: MealEntry = await req.json();
  await updateMeal({ ...body, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteMeal(id);
  return NextResponse.json({ ok: true });
}
