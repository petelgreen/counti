import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings, isOnboarded } from "@/lib/db";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSettings(session.user.id);
  const onboarded = await isOnboarded(session.user.id);
  return NextResponse.json({ ...settings, onboarded });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await saveSettings(session.user.id, {
    calorie_goal:   body.calorie_goal   ? parseInt(body.calorie_goal, 10) : undefined,
    fitness_goal:   body.fitness_goal,
    accuracy_level: body.accuracy_level,
  });
  return NextResponse.json({ ok: true });
}
