import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { getSession } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.id === "saas-admin-1") return NextResponse.json({ error: "Cannot change master admin password" }, { status: 400 });

  try {
    const { current, next, confirm } = await req.json();
    if (!current || !next || !confirm) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (next !== confirm) return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    if (next.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const user = await User.findById(session.id) as any;
    if (!user || !user.password) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const ok = await bcrypt.compare(current, user.password);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    user.password = await bcrypt.hash(next, 10);
    await user.save();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to change password" }, { status: 500 });
  }
}
