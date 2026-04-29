"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/PageShell";

const STATUSES = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;
const PAYMENTS = ["pending", "done"] as const;

interface Props { params: Promise<{ id: string }>; }

export default function OrderDetail({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    try {
      // Use the list endpoint and filter, since there's no GET-by-id route
      const r = await fetch("/api/orders", { cache: "no-store" });
      const data = await r.json();
      const found = Array.isArray(data) ? data.find((o: any) => o._id === id) : null;
      setOrder(found || null);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function update(patch: any) {
    const r = await fetch(`/api/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      const data = await r.json();
      setOrder(data);
      setToast("Saved ✓");
      setTimeout(() => setToast(""), 1800);
    }
  }

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!order) return (
    <div className="py-20 text-center">
      <p className="text-sm text-neutral-500 mb-6">Order not found.</p>
      <Link href="/admin/orders" className="btn-secondary">Back to Orders</Link>
    </div>
  );

  function fmtStatus(s: string) { return (s || "pending").replace(/_/g, " "); }

  return (
    <PageShell title={`Order #${order._id.slice(-8).toUpperCase()}`} subtitle={new Date(order.createdAt).toLocaleString()}>
      {toast && <div className="fixed top-6 right-6 bg-[#0F0F0F] text-white text-xs uppercase tracking-[0.2em] px-5 py-3 z-50 shadow-lg">{toast}</div>}
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#777] hover:text-black"><ArrowLeft className="w-4 h-4" /> Back to Orders</Link>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
        <section className="md:col-span-2 bg-white border border-[#E8E2D5] p-6 space-y-4">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em]">Items</h3>
          <div className="divide-y divide-[#F0EBDF]">
            {(order.items || []).map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-14 h-16 bg-neutral-100 overflow-hidden">{it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <p className="text-sm">{it.name}</p>
                  <p className="text-xs text-[#777]">Size: {it.size} · Qty: {it.quantity}</p>
                </div>
                <p className="text-sm">₹{(it.price * it.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8E2D5] pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#777]">Subtotal</span><span>₹{(order.subtotal || order.total || 0).toLocaleString("en-IN")}</span></div>
            {order.discount ? <div className="flex justify-between text-green-700"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>− ₹{order.discount.toLocaleString("en-IN")}</span></div> : null}
            <div className="flex justify-between font-medium pt-2 border-t border-[#F0EBDF]"><span>Total</span><span>₹{(order.total || 0).toLocaleString("en-IN")}</span></div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white border border-[#E8E2D5] p-6">
            <h3 className="font-heading text-sm uppercase tracking-[0.15em] mb-4">Order Status</h3>
            <select value={order.status || "pending"} onChange={(e) => update({ status: e.target.value })}
              className="w-full text-sm uppercase tracking-[0.1em] px-3 py-2 border border-[#E8E2D5] bg-white capitalize mb-2">
              {STATUSES.map((s) => <option key={s} value={s}>{fmtStatus(s)}</option>)}
            </select>
            <p className="text-xs text-[#777]">Saves automatically.</p>
          </div>

          <div className="bg-white border border-[#E8E2D5] p-6">
            <h3 className="font-heading text-sm uppercase tracking-[0.15em] mb-4">Payment</h3>
            <p className="text-xs text-[#777] mb-1">Method: <span className="text-[#222] uppercase tracking-[0.15em] ml-1">{order.paymentMethod || "razorpay"}</span></p>
            <select value={order.paymentStatus || "pending"} onChange={(e) => update({ paymentStatus: e.target.value })}
              className="w-full text-sm uppercase tracking-[0.1em] px-3 py-2 border border-[#E8E2D5] bg-white capitalize mt-2">
              {PAYMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {order.razorpayPaymentId && <p className="text-xs font-mono text-[#777] mt-3">RZP: {order.razorpayPaymentId}</p>}
          </div>

          <div className="bg-white border border-[#E8E2D5] p-6">
            <h3 className="font-heading text-sm uppercase tracking-[0.15em] mb-4">Customer</h3>
            <p className="text-sm">{order.customer?.name || "—"}</p>
            <p className="text-xs text-[#777] mt-1">{order.customer?.email}</p>
            <p className="text-xs text-[#777]">{order.customer?.phone}</p>
            {order.address && (
              <div className="mt-3 text-xs text-[#777] leading-relaxed">
                {order.address.line1}<br />
                {order.address.city}, {order.address.state} {order.address.pincode}
              </div>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
