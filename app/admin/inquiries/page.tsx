"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import PageShell from "@/components/admin/PageShell";

const STATUS = ["new", "contacted", "resolved"] as const;
const STATUS_BADGE: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  resolved: "bg-green-50 text-green-700",
};

export default function InquiriesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/inquiries", { cache: "no-store" });
      const data = await r.json();
      setList(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: any) {
    await fetch(`/api/inquiries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <PageShell title="Inquiries" subtitle="Custom-fit requests and customer enquiries.">
      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : list.length === 0 ? <p className="py-20 text-center text-sm text-[#777]">No inquiries yet.</p>
        : (
          <div className="border border-[#E8E2D5] bg-white">
            <table className="w-full">
              <thead className="bg-[#F8F6F2] border-b border-[#E8E2D5]">
                <tr>{["Date","Type","Name","Contact","Product","Status","Action"].map(h => <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#777]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((q) => (
                  <tr key={q._id} className="border-b border-[#F0EBDF] last:border-b-0">
                    <td className="px-5 py-3 text-xs text-[#777]">{q.createdAt ? new Date(q.createdAt).toLocaleString() : "—"}</td>
                    <td className="px-5 py-3 text-xs uppercase tracking-[0.15em]">{(q.type || "general").replace(/_/g, " ")}</td>
                    <td className="px-5 py-3 text-sm">{q.name || "—"}</td>
                    <td className="px-5 py-3 text-xs">
                      <p>{q.email}</p>
                      <p className="text-[#777]">{q.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-sm">{q.productName || "—"}</td>
                    <td className="px-5 py-3">
                      <select value={q.status || "new"} onChange={(e) => update(q._id, { status: e.target.value })}
                        className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 ${STATUS_BADGE[q.status || "new"]} border-0 capitalize`}>
                        {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3"><button onClick={() => remove(q._id)} className="text-[#777] hover:text-[#8B1A1A]"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </PageShell>
  );
}
