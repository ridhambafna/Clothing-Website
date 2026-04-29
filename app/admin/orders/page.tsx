"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/admin/PageShell";
import { Loader2, Eye } from "lucide-react";

const STATUSES = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;
const PAYMENTS = ["pending", "done"] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-amber-50 text-amber-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/orders", { cache: "no-store" });
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: any) {
    const r = await fetch(`/api/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      setToast("Saved ✓");
      setTimeout(() => setToast(""), 1800);
    }
    await load();
  }

  function fmtStatus(s: string) { return (s || "pending").replace(/_/g, " "); }

  return (
    <PageShell title="Orders" subtitle="View and manage customer orders. Status saves on selection.">
      {toast && <div className="fixed top-6 right-6 bg-[#0F0F0F] text-white text-xs uppercase tracking-[0.2em] px-5 py-3 z-50 shadow-lg">{toast}</div>}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-500" /></div>
      ) : orders.length === 0 ? (
        <p className="py-20 text-center text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <div className="border border-[#E8E2D5] bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E8E2D5] bg-[#F8F6F2]">
              <tr>
                {["Order", "Date", "Customer", "Items", "Total", "Method", "Status", "Payment", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-[#F0EBDF] last:border-b-0">
                  <td className="px-4 py-3 text-sm font-mono">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-xs text-[#777]">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-sm">{o.customer?.name || o.customer?.email || "—"}</td>
                  <td className="px-4 py-3 text-sm">{o.items?.length || 0}</td>
                  <td className="px-4 py-3 text-sm">₹{(o.total || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.15em]">{o.paymentMethod || "razorpay"}</td>
                  <td className="px-4 py-3">
                    <select value={o.status || "pending"}
                      onChange={(e) => update(o._id, { status: e.target.value })}
                      className={`text-xs uppercase tracking-[0.1em] px-2 py-1 border-0 capitalize ${STATUS_BADGE[o.status || "pending"]}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{fmtStatus(s)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.paymentStatus || "pending"}
                      onChange={(e) => update(o._id, { paymentStatus: e.target.value })}
                      className="text-xs uppercase tracking-[0.1em] px-2 py-1 border border-[#E8E2D5] bg-white capitalize">
                      {PAYMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="text-[#C5A572] hover:text-[#B8965A] inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em]">
                      <Eye className="w-4 h-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
