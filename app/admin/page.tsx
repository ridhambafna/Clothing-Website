"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, Users, Package, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import PageShell from "@/components/admin/PageShell";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-amber-50 text-amber-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    fetch(`/api/analytics?range=${range}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then(setData);
  }, [range]);

  if (!data) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <PageShell title="Dashboard" subtitle="Live overview of your store.">
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Stat icon={TrendingUp} label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString("en-IN")}`} hint={`₹${(data.revenueToday || 0).toLocaleString("en-IN")} today`} />
        <Stat icon={ShoppingBag} label="Total Orders" value={data.totalOrders || 0} hint={`${data.byStatus?.pending || 0} pending · ${data.byStatus?.delivered || 0} delivered`} />
        <Stat icon={Users} label="Customers" value={data.customers || 0} />
        <Stat icon={Package} label="Active Products" value={data.totalProducts || 0} />
      </div>

      <section className="bg-white border border-[#E8E2D5] p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em]">Revenue</h3>
          <div className="flex border border-[#E8E2D5]">
            {(["7d", "30d"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] ${range === r ? "bg-[#0F0F0F] text-[#C5A572]" : "text-[#777] hover:text-black"}`}>
                {r === "7d" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data.revenueSeries || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBDF" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#777", fontSize: 11 }} />
              <Tooltip formatter={(v: any) => `₹${(v as number).toLocaleString("en-IN")}`} />
              <Line type="monotone" dataKey="revenue" stroke="#C5A572" strokeWidth={2} dot={{ fill: "#C5A572", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" /> Top Selling
          </h3>
          {(data.topProducts || []).length === 0 ? (
            <p className="text-sm text-[#777]">No sales yet.</p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBDF" />
                  <XAxis type="number" tick={{ fill: "#777", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#222", fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#C5A572" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#8B1A1A]" /> Low Stock
          </h3>
          {(data.lowStock || []).length === 0 ? (
            <p className="text-sm text-[#777]">All stock above 5 units.</p>
          ) : (
            <div className="divide-y divide-[#F0EBDF]">
              {data.lowStock.map((p: any) => (
                <div key={p._id} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-12 bg-neutral-100">{p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <p className="text-sm">{p.name}</p>
                    <p className="text-xs text-[#777] font-mono">{p.sku || "—"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-700 uppercase tracking-[0.15em]">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-white border border-[#E8E2D5] p-6">
        <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Recent Orders</h3>
        {(data.recentOrders || []).length === 0 ? (
          <p className="text-sm text-[#777]">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-[#777] border-b border-[#E8E2D5]">
              <th className="py-2">Order</th><th className="py-2">Customer</th><th className="py-2">Date</th><th className="py-2">Total</th><th className="py-2">Status</th>
            </tr></thead>
            <tbody>
              {data.recentOrders.map((o: any) => (
                <tr key={o._id} className="border-b border-[#F0EBDF] last:border-b-0">
                  <td className="py-3"><Link href={`/admin/orders/${o._id}`} className="font-mono text-[#C5A572] hover:underline">#{o._id.slice(-8).toUpperCase()}</Link></td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3 text-xs text-[#777]">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="py-3">₹{(o.total || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3"><span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 ${STATUS_BADGE[o.status || "pending"]}`}>{(o.status || "pending").replace(/_/g, " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="bg-white border border-[#E8E2D5] p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777]">{label}</p>
        <Icon className="w-5 h-5 stroke-[1.5] text-[#C5A572]" />
      </div>
      <p className="font-heading text-2xl">{value}</p>
      {hint && <p className="text-xs text-[#777] mt-1">{hint}</p>}
    </div>
  );
}
