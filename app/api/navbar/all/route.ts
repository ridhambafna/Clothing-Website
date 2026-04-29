import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NavLink } from "@/lib/models";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  const all = await NavLink.find().sort({ parentId: 1, order: 1, createdAt: 1 }).lean();
  return NextResponse.json(all.map((l: any) => ({ ...l, _id: String(l._id), parentId: l.parentId || null })));
}
