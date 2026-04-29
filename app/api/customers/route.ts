import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Order } from "@/lib/models";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 }).lean();
  const stats = await Order.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 }, total: { $sum: "$total" } } },
  ]);
  const map = Object.fromEntries(stats.map((c: any) => [c._id, c]));
  return NextResponse.json(users.map((u: any) => ({
    ...u,
    orderCount: map[u._id.toString()]?.count || 0,
    totalSpent: map[u._id.toString()]?.total || 0,
  })));
}
