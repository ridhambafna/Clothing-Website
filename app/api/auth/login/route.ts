import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { isAdminCreds, setSessionCookie } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    if (isAdminCreds(email, password)) {
      const user = { id: "saas-admin-1", email, name: "Super Admin", role: "admin" as const };
      await setSessionCookie(user);
      return NextResponse.json({ user });
    }

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const dbUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!dbUser || !dbUser.password) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const ok = await bcrypt.compare(password, dbUser.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (dbUser.blocked) return NextResponse.json({ error: "Account is blocked" }, { status: 403 });

    const user = { id: dbUser._id.toString(), email: dbUser.email, name: dbUser.name, role: dbUser.role || "user" };
    await setSessionCookie(user);
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login failed" }, { status: 500 });
  }
}
