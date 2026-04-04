import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "סיסמה חייבת להכיל לפחות 6 תווים" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "האימייל כבר רשום" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await createUser({ id, email, name, password_hash });

  return NextResponse.json({ ok: true });
}
