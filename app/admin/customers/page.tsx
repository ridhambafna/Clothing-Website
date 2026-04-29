"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/admin/PageShell";
import { Loader2, Eye } from "lucide-react";

type Tab = "all" | "purchased" | "no_purchases";

export default function CustomersPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/customers", { cache: "no-store" });
      const data = await r.json();
      setList(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (tab === "purchased") return list.filter((c) => (c.orderCount || 0) > 0);
    if (tab === "no_purchases") return list.filter((c) => (c.orderCount || 0) === 0);
    return list;
  }, [list, tab]);

  async function toggleBlock(id: string, blocked: boolean) {
    await fetch(`/api/customers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blocked }) });
    await load();
  }

  return (
    <PageShell title="Customers" subtitle="Registered customer accounts and their order history.">
      <div className="flex gap-2 mb-6 border-b border-[#E8E2D5]">
        {([
          { k: "all", l: `All Customers (${list.length})` },
          { k: "purchased", l: `Has Purchased (${list.filter(c => (c.orderCount||0) > 0).length})` },
          { k: "no_purchases", l: `No Purchases (${list.filter(c => (c.orderCount||0) === 0).length})` },
        ] as const).map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] transition border-b-2 -mb-px ${tab === t.k ? "border-[#C5A572] text-[#C5A572]" : "border-transparent text-[#777] hover:text-[#222]"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : filtered.length === 0 ? <p className="py-20 text-center text-sm text-[#777]">No customers in this view.</p>
        : (
          <div className="border border-[#E8E2D5] bg-white">
            <table className="w-full">
              <thead className="bg-[#F8F6F2] border-b border-[#E8E2D5]">
                <tr>{["Name","Email","Phone","Registered","Orders","Spent","Status",""].map(h => <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#777]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b border-[#F0EBDF] last:border-b-0">
                    <td className="px-5 py-3 text-sm">{c.name || "—"}</td>
                    <td className="px-5 py-3 text-sm">{c.email}</td>
                    <td className="px-5 py-3 text-sm">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-xs text-[#777]">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3 text-sm">{c.orderCount || 0}</td>
                    <td className="px-5 py-3 text-sm">₹{(c.totalSpent || 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-xs uppercase tracking-[0.15em]">{c.blocked ? "Blocked" : "Active"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 items-center">
                        <Link href={`/admin/customers/${c._id}`} className="text-[#C5A572] hover:text-[#B8965A]"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => toggleBlock(c._id, !c.blocked)} className="text-xs uppercase tracking-[0.15em] underline">
                          {c.blocked ? "Unblock" : "Block"}
                        </button>
                      </div>
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
