import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const doc = await Inquiry.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  await Inquiry.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
