import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NavLink } from "@/lib/models";

// Returns nested links: top-level items + their children grouped under parentId
export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  const all = await NavLink.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean() as any[];
  const tops = all.filter((l) => !l.parentId);
  const children: Record<string, any[]> = {};
  for (const l of all) if (l.parentId) (children[l.parentId] ||= []).push(l);
  return NextResponse.json(tops.map((t) => ({
    _id: String(t._id),
    label: t.label,
    href: t.href,
    children: (children[String(t._id)] || []).map((c) => ({ label: c.label, href: c.href })),
  })));
}

export async function POST(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const doc = await NavLink.create(body);
    return NextResponse.json(doc.toObject());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
