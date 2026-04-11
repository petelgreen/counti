import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    session: session ? {
      userId: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
    } : null
  });
}
