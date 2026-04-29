"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/admin/PageShell";
import { Loader2 } from "lucide-react";

export default function PaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" }).then(r => r.ok ? r.json() : []).then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Payments" subtitle="Razorpay transaction log.">
      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : orders.length === 0 ? <p className="py-20 text-center text-sm text-neutral-500">No transactions yet.</p>
        : (
          <div className="border border-neutral-200 bg-white">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>{["Order","Customer","Amount","Status","Razorpay ID","Date"].map(h => <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-neutral-500">{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-neutral-100 last:border-b-0">
                    <td className="px-5 py-3 text-sm font-mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-sm">{o.customer?.email || "—"}</td>
                    <td className="px-5 py-3 text-sm">₹{(o.total || 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-xs uppercase tracking-[0.15em]">{o.paymentStatus || "pending"}</td>
                    <td className="px-5 py-3 text-xs font-mono">{o.razorpayPaymentId || "—"}</td>
                    <td className="px-5 py-3 text-sm">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </PageShell>
  );
}
