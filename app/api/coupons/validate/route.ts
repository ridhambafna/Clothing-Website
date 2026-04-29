import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "Code required" }, { status: 400 });

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ valid: false, error: "Database not configured" }, { status: 503 });

    const c = await Coupon.findOne({ code: String(code).trim().toUpperCase() }).lean() as any;
    if (!c || !c.active) return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 200 });
    if (c.expiry && new Date(c.expiry) < new Date()) return NextResponse.json({ valid: false, error: "Code expired" });
    if (c.minOrder && subtotal < c.minOrder) return NextResponse.json({ valid: false, error: `Min order ₹${c.minOrder}` });

    const discount = c.type === "flat" ? c.value : Math.round((subtotal * c.value) / 100);
    return NextResponse.json({ valid: true, code: c.code, discount, type: c.type, value: c.value });
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e.message }, { status: 500 });
  }
}
