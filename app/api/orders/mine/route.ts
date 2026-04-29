import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  return NextResponse.json(await Order.find({ userId: session.id }).sort({ createdAt: -1 }).lean());
}
