"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/admin/PageShell";
import { Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function AnnouncementAdmin() {
  const { flags, setFlag } = useApp();
  const [data, setData] = useState({ text: "", link: "/", bg: "#0F0F0F", color: "#C5A572" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/banners", { cache: "no-store" }).then((r) => r.ok ? r.json() : {}).then((d: any) => {
      setData({
        text: d.announcementText || "",
        link: d.announcementLink || "/",
        bg: d.announcementBg || "#0F0F0F",
        color: d.announcementColor || "#C5A572",
      });
    }).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      // Merge into the existing banners settings doc
      const existing = await fetch("/api/banners", { cache: "no-store" }).then((r) => r.ok ? r.json() : {});
      const merged = { ...existing, announcementText: data.text, announcementLink: data.link, announcementBg: data.bg, announcementColor: data.color };
      await fetch("/api/banners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(merged) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const lc = "block text-xs uppercase tracking-[0.2em] text-[#777] mb-2";
  const ic = "w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]";

  return (
    <PageShell title="Announcement Bar" subtitle="Edit the bar at the top of the storefront. Saves immediately on Save.">
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white border border-[#E8E2D5] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm">Show Announcement Bar</p>
            <p className="text-xs text-[#777] mt-0.5">Master toggle. Also configurable from Feature Controls.</p>
          </div>
          <button onClick={() => setFlag("announcementBar", !flags.announcementBar)}
            className={`relative inline-flex h-6 w-11 rounded-full transition ${flags.announcementBar ? "bg-[#C5A572]" : "bg-neutral-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${flags.announcementBar ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        <div className="bg-white border border-[#E8E2D5] p-6 space-y-5">
          <div><label className={lc}>Text</label>
            <input className={ic} value={data.text} onChange={(e) => setData({ ...data, text: e.target.value })} placeholder="Premium Festive Edit — 15% off your first order" />
          </div>
          <div><label className={lc}>Link (optional)</label>
            <input className={ic} value={data.link} onChange={(e) => setData({ ...data, link: e.target.value })} placeholder="/collections/kurta" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Background Color</label>
              <div className="flex gap-2">
                <input type="color" value={data.bg} onChange={(e) => setData({ ...data, bg: e.target.value })} className="w-12 h-12 border border-[#E8E2D5] cursor-pointer" />
                <input type="text" value={data.bg} onChange={(e) => setData({ ...data, bg: e.target.value })} className={ic} />
              </div>
            </div>
            <div>
              <label className={lc}>Text Color</label>
              <div className="flex gap-2">
                <input type="color" value={data.color} onChange={(e) => setData({ ...data, color: e.target.value })} className="w-12 h-12 border border-[#E8E2D5] cursor-pointer" />
                <input type="text" value={data.color} onChange={(e) => setData({ ...data, color: e.target.value })} className={ic} />
              </div>
            </div>
          </div>

          <div>
            <p className={lc}>Preview</p>
            <div className="py-3 text-center text-sm uppercase tracking-widest" style={{ backgroundColor: data.bg, color: data.color }}>
              {data.text || "Your announcement here"}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            {saved && <span className="text-xs uppercase tracking-[0.2em] text-green-700">Saved ✓</span>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
