"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/admin/PageShell";
import CrudTable from "@/components/admin/CrudTable";
import ImageUpload from "@/components/admin/ImageUpload";
import { Loader2 } from "lucide-react";

export default function BannersPage() {
  const [data, setData] = useState<any>({ heroImage: "", heroTitle: "", heroSubtitle: "", heroCta: "", announcementText: "", announcementLink: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/banners", { cache: "no-store" }).then(r => r.ok ? r.json() : {}).then((d) => setData((p: any) => ({ ...p, ...d }))).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      await fetch("/api/banners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const ic = "w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black";
  const lc = "block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2";

  return (
    <PageShell title="Manage Banners" subtitle="Hero, announcement bar, and promotional banners.">
      <div className="space-y-10">
        <section className="bg-white border border-neutral-200 p-8 max-w-3xl">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-5">Hero Banner</h3>
          <div className="space-y-5">
            <ImageUpload label="Hero Image" value={data.heroImage} onChange={(url) => setData({ ...data, heroImage: url })} />
            <div><label className={lc}>Headline</label><input className={ic} value={data.heroTitle || ""} onChange={(e) => setData({ ...data, heroTitle: e.target.value })} /></div>
            <div><label className={lc}>Subheadline</label><input className={ic} value={data.heroSubtitle || ""} onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })} /></div>
            <div><label className={lc}>CTA Button Text</label><input className={ic} value={data.heroCta || ""} onChange={(e) => setData({ ...data, heroCta: e.target.value })} /></div>
          </div>
        </section>

        <section className="bg-white border border-neutral-200 p-8 max-w-3xl">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-5">Announcement Bar</h3>
          <div className="space-y-5">
            <div><label className={lc}>Text</label><input className={ic} value={data.announcementText || ""} onChange={(e) => setData({ ...data, announcementText: e.target.value })} /></div>
            <div><label className={lc}>Link</label><input className={ic} value={data.announcementLink || ""} onChange={(e) => setData({ ...data, announcementLink: e.target.value })} /></div>
          </div>
        </section>

        <div className="flex gap-3 items-center max-w-3xl">
          <button onClick={save} disabled={saving} className="bg-black text-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Hero & Announcement"}
          </button>
          {saved && <span className="text-xs uppercase tracking-[0.2em] text-green-700">Saved ✓</span>}
        </div>

        <section className="max-w-5xl">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-5">Promotional Banners</h3>
          <CrudTable
            resource="banner-list"
            defaultValues={{ active: true, order: 0 }}
            fields={[
              { key: "title", label: "Title" },
              { key: "subtitle", label: "Subtitle" },
              { key: "image", label: "Image", type: "image" },
              { key: "link", label: "Link" },
              { key: "order", label: "Display Order", type: "number" },
              { key: "active", label: "Active", type: "checkbox" },
            ]}
            columns={[
              { key: "title", label: "Title" },
              { key: "image", label: "Preview", render: (r) => r.image ? <img src={r.image} alt="" className="w-16 h-12 object-cover" /> : "—" },
              { key: "link", label: "Link" },
              { key: "order", label: "Order" },
              { key: "active", label: "Active", render: (r) => r.active ? "Yes" : "No" },
            ]}
          />
        </section>
      </div>
    </PageShell>
  );
}
