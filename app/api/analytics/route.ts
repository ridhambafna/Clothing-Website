import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, User, Product } from "@/lib/models";

export async function GET(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({
      revenueToday: 0, revenueMonth: 0, totalRevenue: 0, totalOrders: 0, customers: 0,
      totalProducts: 0, byStatus: {}, topProducts: [], lowStock: [], recentOrders: [],
      revenueSeries: [], categoryRevenue: [], customerSeries: [],
    });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const since = new Date(now.getTime() - days * 24 * 3600 * 1000);

  const [orders, customers, totalProducts, lowStockDocs, allUsers, allProducts] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).lean(),
    User.countDocuments({ role: { $ne: "admin" } }),
    Product.countDocuments({}),
    Product.find({ stock: { $lt: 5 } }).select("name image stock sku").limit(10).lean(),
    User.find({ role: { $ne: "admin" } }).select("createdAt").lean(),
    Product.find({}).select("name category").lean(),
  ]);

  const completed = (orders as any[]).filter((o) => o.paymentStatus === "done" || o.paymentStatus === "paid" || o.status === "delivered");

  const revenueToday = completed.filter((o) => new Date(o.createdAt) >= dayStart).reduce((s, o) => s + (o.total || 0), 0);
  const revenueMonth = completed.filter((o) => new Date(o.createdAt) >= monthStart).reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);

  const byStatus: Record<string, number> = {};
  for (const o of orders as any[]) byStatus[o.status || "pending"] = (byStatus[o.status || "pending"] || 0) + 1;

  const productCounts: Record<string, { name: string; sold: number; revenue: number }> = {};
  for (const o of orders as any[]) {
    for (const it of o.items || []) {
      const k = it.productId || it.name || "_";
      if (!productCounts[k]) productCounts[k] = { name: it.name, sold: 0, revenue: 0 };
      productCounts[k].sold += it.quantity || 1;
      productCounts[k].revenue += (it.price || 0) * (it.quantity || 1);
    }
  }
  const topProducts = Object.values(productCounts).sort((a, b) => b.sold - a.sold).slice(0, 5);

  const recentOrders = (orders as any[]).slice(0, 10).map((o) => ({
    _id: String(o._id),
    customer: o.customer?.name || o.customer?.email || "—",
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
  }));

  // Revenue series
  const series: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    series[k] = 0;
  }
  for (const o of completed) {
    if (new Date(o.createdAt) < since) continue;
    const d = new Date(o.createdAt);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (k in series) series[k] += o.total || 0;
  }
  const revenueSeries = Object.entries(series).map(([date, revenue]) => ({ date, revenue }));

  // Revenue by category
  const productCat = new Map<string, string>();
  for (const p of allProducts as any[]) productCat.set(String(p._id), p.category || "uncategorised");
  const catRev: Record<string, number> = {};
  for (const o of completed) {
    for (const it of o.items || []) {
      const cat = (it.productId && productCat.get(it.productId)) || "uncategorised";
      catRev[cat] = (catRev[cat] || 0) + (it.price || 0) * (it.quantity || 1);
    }
  }
  const categoryRevenue = Object.entries(catRev).map(([category, revenue]) => ({ category, revenue }));

  // Customer signup series
  const custSeries: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    custSeries[k] = 0;
  }
  for (const u of allUsers as any[]) {
    if (!u.createdAt) continue;
    if (new Date(u.createdAt) < since) continue;
    const d = new Date(u.createdAt);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (k in custSeries) custSeries[k] += 1;
  }
  const customerSeries = Object.entries(custSeries).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    revenueToday, revenueMonth, totalRevenue,
    totalOrders: orders.length, customers, totalProducts,
    byStatus, topProducts,
    lowStock: lowStockDocs,
    recentOrders,
    revenueSeries, categoryRevenue, customerSeries,
  });
}
