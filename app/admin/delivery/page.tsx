"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/admin/PageShell";
import { Loader2 } from "lucide-react";

export default function DeliveryPage() {
  const [data, setData] = useState({ panIndia: true, deliveryDays: 4, excludedPincodes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/delivery", { cache: "no-store" }).then(r => r.ok ? r.json() : {}).then((d: any) => {
      setData({
        panIndia: d.panIndia !== false,
        deliveryDays: typeof d.deliveryDays === "number" ? d.deliveryDays : 4,
        excludedPincodes: Array.isArray(d.excludedPincodes) ? d.excludedPincodes.join(", ") : (d.excludedPincodes || ""),
      });
    }).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      const body = {
        panIndia: data.panIndia,
        deliveryDays: Number(data.deliveryDays) || 4,
        excludedPincodes: data.excludedPincodes.split(",").map(s => s.trim()).filter(Boolean),
      };
      await fetch("/api/delivery", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const ic = "w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black";
  const lc = "block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2";

  return (
    <PageShell title="Delivery Settings" subtitle="Pan-India coverage with optional excluded pincodes.">
      <div className="bg-white border border-neutral-200 p-8 max-w-2xl">
        <button onClick={() => setData({ ...data, panIndia: !data.panIndia })}
          className="flex items-center justify-between w-full py-3 mb-6">
          <div className="text-left">
            <p className="text-sm uppercase tracking-[0.15em]">Pan-India Delivery</p>
            <p className="text-xs text-neutral-500 font-light mt-0.5">Deliver to any valid Indian pincode</p>
          </div>
          <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${data.panIndia ? "bg-black" : "bg-neutral-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${data.panIndia ? "left-5" : "left-0.5"}`} />
          </span>
        </button>

        <div className="mb-6">
          <label className={lc}>Default Delivery Days</label>
          <input type="number" value={data.deliveryDays} onChange={(e) => setData({ ...data, deliveryDays: Number(e.target.value) })} className={ic} />
        </div>

        <div className="mb-6">
          <label className={lc}>Excluded Pincodes <span className="text-neutral-400 normal-case tracking-normal">(comma-separated, optional)</span></label>
          <textarea rows={3} value={data.excludedPincodes} onChange={(e) => setData({ ...data, excludedPincodes: e.target.value })}
            className={`${ic} font-mono`} placeholder="e.g. 110001, 400001" />
          <p className="text-xs text-neutral-500 mt-2 font-light">These pincodes will show &quot;not available&quot; even when pan-India is on.</p>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={save} disabled={saving} className="bg-black text-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-xs uppercase tracking-[0.2em] text-green-700">Saved ✓</span>}
        </div>
      </div>
    </PageShell>
  );
}
