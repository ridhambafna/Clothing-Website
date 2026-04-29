import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/lib/models";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  return NextResponse.json(await Coupon.find().sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    if (body.code) body.code = String(body.code).trim().toUpperCase();
    const doc = await Coupon.create(body);
    return NextResponse.json(doc.toObject());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
