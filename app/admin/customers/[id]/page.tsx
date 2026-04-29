"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/PageShell";

interface Props { params: Promise<{ id: string }>; }

export default function CustomerDetail({ params }: Props) {
  const { id } = use(params);
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${id}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then(setC)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!c) return <div className="py-20 text-center"><p className="text-sm">Customer not found.</p></div>;

  return (
    <PageShell title={c.name || c.email} subtitle={c.email}>
      <Link href="/admin/customers" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#777] hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl">
        <div className="bg-white border border-[#E8E2D5] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Total Orders</p>
          <p className="font-heading text-3xl">{c.orderCount || 0}</p>
        </div>
        <div className="bg-white border border-[#E8E2D5] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Total Spent</p>
          <p className="font-heading text-3xl">₹{(c.totalSpent || 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white border border-[#E8E2D5] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Status</p>
          <p className="font-heading text-2xl uppercase tracking-[0.15em]">{c.blocked ? "Blocked" : "Active"}</p>
        </div>
      </div>

      <section className="bg-white border border-[#E8E2D5] p-6 mb-6 max-w-4xl">
        <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Contact</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-[#777]">Email</span><span>{c.email}</span>
          <span className="text-[#777]">Phone</span><span>{c.phone || "—"}</span>
          <span className="text-[#777]">DOB</span><span>{c.dob || "—"}</span>
          <span className="text-[#777]">Gender</span><span className="capitalize">{(c.gender || "").replace(/_/g, " ") || "—"}</span>
          <span className="text-[#777]">Registered</span><span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</span>
        </div>
      </section>

      <section className="bg-white border border-[#E8E2D5] p-6 max-w-4xl">
        <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-4">Order History</h3>
        {(!c.orders || c.orders.length === 0) ? (
          <p className="text-sm text-[#777] py-3">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-[#777] border-b border-[#E8E2D5]">
              <th className="py-2">Order ID</th><th className="py-2">Date</th><th className="py-2">Items</th><th className="py-2">Amount</th><th className="py-2">Status</th>
            </tr></thead>
            <tbody>
              {c.orders.map((o: any) => (
                <tr key={o._id} className="border-b border-[#F0EBDF] last:border-b-0">
                  <td className="py-3"><Link href={`/admin/orders/${o._id}`} className="font-mono text-[#C5A572] hover:underline">#{o._id.slice(-8).toUpperCase()}</Link></td>
                  <td className="py-3 text-xs text-[#777]">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">{o.items?.length || 0}</td>
                  <td className="py-3">₹{(o.total || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 text-xs uppercase tracking-[0.15em] capitalize">{(o.status || "pending").replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </PageShell>
  );
}
