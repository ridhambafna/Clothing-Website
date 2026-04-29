import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Settings } from "@/lib/models";

const KEY = "banners";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({});
  const doc = await Settings.findOne({ key: KEY }).lean() as any;
  return NextResponse.json(doc?.value || {});
}

export async function PUT(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const existing = await Settings.findOne({ key: KEY }) as any;
  if (existing) { existing.value = body; await existing.save(); }
  else await Settings.create({ key: KEY, value: body });
  return NextResponse.json(body);
}
