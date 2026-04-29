import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const patch = await req.json();
    // Auto-mark COD orders as paid when delivered
    const existing = await Order.findById(id) as any;
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextStatus = patch.status ?? existing.status;
    const nextMethod = patch.paymentMethod ?? existing.paymentMethod ?? "razorpay";
    if (nextStatus === "delivered" && nextMethod === "cod" && patch.paymentStatus === undefined) {
      patch.paymentStatus = "done";
    }

    const doc = await Order.findByIdAndUpdate(id, patch, { new: true }).lean();
    return NextResponse.json(doc);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
