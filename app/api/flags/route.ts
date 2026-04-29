import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Settings } from "@/lib/models";
import { DEFAULT_FLAGS } from "@/lib/feature-flags";

const KEY = "feature-flags";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json(DEFAULT_FLAGS);
  const doc = await Settings.findOne({ key: KEY }).lean() as any;
  return NextResponse.json({ ...DEFAULT_FLAGS, ...(doc?.value || {}) });
}

export async function PATCH(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const existing = await Settings.findOne({ key: KEY }) as any;
  const merged = { ...DEFAULT_FLAGS, ...(existing?.value || {}), ...body };
  if (existing) { existing.value = merged; await existing.save(); }
  else await Settings.create({ key: KEY, value: merged });
  return NextResponse.json(merged);
}
