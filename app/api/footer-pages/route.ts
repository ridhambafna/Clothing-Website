import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FooterPage } from "@/lib/models";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  return NextResponse.json(await FooterPage.find().sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    if (!body.slug || !body.title) return NextResponse.json({ error: "Slug and title required" }, { status: 400 });
    const doc = await FooterPage.create(body);
    return NextResponse.json(doc.toObject());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
