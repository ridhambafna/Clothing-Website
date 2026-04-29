import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { setSessionCookie } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be 6+ characters" }, { status: 400 });

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const dbUser = await User.create({ name, email: email.trim().toLowerCase(), password: hash, role: "user" });

    const user = { id: dbUser._id.toString(), email: dbUser.email, name: dbUser.name, role: "user" as const };
    await setSessionCookie(user);
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Signup failed" }, { status: 500 });
  }
}
