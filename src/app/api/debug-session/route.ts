import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  const cookies = req.cookies.getAll().map(c => c.name);
  return NextResponse.json({
    session: session ? {
      userId: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
    } : null,
    cookies,
  });
}
