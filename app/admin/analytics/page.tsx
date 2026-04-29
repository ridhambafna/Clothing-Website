"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import PageShell from "@/components/admin/PageShell";

const COLORS = ["#C5A572", "#0F0F0F", "#777777", "#B8965A", "#8B1A1A", "#D4AF37"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetch(`/api/analytics?range=${range}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then(setData);
  }, [range]);

  if (!data) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const statusEntries = Object.entries(data.byStatus || {}).map(([name, value]) => ({ name: String(name).replace(/_/g, " "), value }));
  const top5 = (data.topProducts || []).slice(0, 5);

  return (
    <PageShell title="Analytics" subtitle="Live data from your store.">
      <div className="flex justify-end mb-6">
        <div className="flex border border-[#E8E2D5]">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] ${range === r ? "bg-[#0F0F0F] text-[#C5A572]" : "text-[#777] hover:text-black"}`}>
              {r === "7d" ? "Daily" : r === "30d" ? "Monthly" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-white border border-[#E8E2D5] p-6 mb-6">
        <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Sales Over Time</h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={data.revenueSeries || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A572" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#C5A572" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBDF" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#777", fontSize: 11 }} />
              <Tooltip formatter={(v: any) => `₹${(v as number).toLocaleString("en-IN")}`} />
              <Area type="monotone" dataKey="revenue" stroke="#C5A572" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Revenue by Category</h3>
          {(data.categoryRevenue || []).length === 0 ? (
            <p className="text-sm text-[#777] py-8">No revenue data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={data.categoryRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBDF" />
                  <XAxis dataKey="category" tick={{ fill: "#222", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#777", fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `₹${(v as number).toLocaleString("en-IN")}`} />
                  <Bar dataKey="revenue" fill="#C5A572" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Orders by Status</h3>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-[#777] py-8">No orders yet.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusEntries} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {statusEntries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Top 5 Products</h3>
          {top5.length === 0 ? (
            <p className="text-sm text-[#777] py-8">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {top5.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-center font-heading text-[#C5A572]">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm">{p.name}</p>
                    <p className="text-xs text-[#777]">₹{(p.revenue || 0).toLocaleString("en-IN")} · {p.sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-[#E8E2D5] p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Customer Acquisition</h3>
          {(data.customerSeries || []).length === 0 ? (
            <p className="text-sm text-[#777] py-8">No new customers yet.</p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={data.customerSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBDF" />
                  <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: "#777", fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0F0F0F" strokeWidth={2} dot={{ fill: "#C5A572", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
