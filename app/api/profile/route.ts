import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.id === "saas-admin-1") {
    return NextResponse.json({ id: session.id, name: session.name, email: session.email, phone: "", dob: "", gender: "" });
  }
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await User.findById(session.id).select("-password").lean() as any;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: user._id.toString(),
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    dob: user.dob || "",
    gender: user.gender || "",
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.id === "saas-admin-1") return NextResponse.json({ error: "Cannot edit master admin profile" }, { status: 400 });

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  try {
    const body = await req.json();
    const allowed: any = {};
    if (body.name !== undefined) allowed.name = body.name;
    if (body.phone !== undefined) allowed.phone = body.phone;
    if (body.dob !== undefined) allowed.dob = body.dob;
    if (body.gender !== undefined && ["male", "female", "rather_not_say", ""].includes(body.gender)) allowed.gender = body.gender;
    const user = await User.findByIdAndUpdate(session.id, allowed, { new: true }).select("-password").lean() as any;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      dob: user.dob || "",
      gender: user.gender || "",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
