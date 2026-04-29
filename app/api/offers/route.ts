import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Offer } from "@/lib/models";

export async function GET(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  const url = new URL(req.url);
  const onBar = url.searchParams.get("bar") === "1";
  const q: any = {};
  if (onBar) {
    q.showOnBar = true;
    q.active = true;
    const now = new Date();
    q.$and = [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
    ];
  }
  const docs = await Offer.find(q).sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const doc = await Offer.create(body);
    return NextResponse.json(doc.toObject());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
