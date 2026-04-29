import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Order } from "@/lib/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await User.findById(id).select("-password").lean() as any;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean();
  const totalSpent = (orders as any[]).reduce((s, o: any) => s + (o.total || 0), 0);
  return NextResponse.json({ ...user, orders, totalSpent, orderCount: orders.length });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const allowed: any = {};
    if (typeof body.blocked === "boolean") allowed.blocked = body.blocked;
    if (body.name) allowed.name = body.name;
    if (body.phone) allowed.phone = body.phone;
    const doc = await User.findByIdAndUpdate(id, allowed, { new: true }).select("-password").lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
