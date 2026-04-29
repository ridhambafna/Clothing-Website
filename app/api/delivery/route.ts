import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Settings } from "@/lib/models";

const KEY = "delivery";
const DEFAULTS = { panIndia: true, deliveryDays: 4, excludedPincodes: [] as string[] };

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json(DEFAULTS);
  const doc = await Settings.findOne({ key: KEY }).lean() as any;
  return NextResponse.json({ ...DEFAULTS, ...(doc?.value || {}) });
}

export async function PUT(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const value = { ...DEFAULTS, ...body };
  const existing = await Settings.findOne({ key: KEY }) as any;
  if (existing) { existing.value = value; await existing.save(); }
  else await Settings.create({ key: KEY, value });
  return NextResponse.json(value);
}
