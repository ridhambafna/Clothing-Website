"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/admin/PageShell";
import { Loader2 } from "lucide-react";
import { brandConfig } from "@/brand.config";
import { useApp } from "@/contexts/AppContext";

const FIELDS = [
  { key: "name", label: "Store Name" },
  { key: "tagline", label: "Tagline" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp Number" },
  { key: "address", label: "Address" },
  { key: "logo", label: "Logo URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "facebook", label: "Facebook URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "pinterest", label: "Pinterest URL" },
];

export default function SettingsPage() {
  const { flags, setFlag } = useApp();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then(r => r.ok ? r.json() : {}).then((data: any) => {
      setForm({
        name: data.name ?? brandConfig.name,
        tagline: data.tagline ?? brandConfig.tagline,
        email: data.email ?? brandConfig.email,
        phone: data.phone ?? brandConfig.phone,
        whatsapp: data.whatsapp ?? brandConfig.whatsapp,
        address: data.address ?? brandConfig.address,
        logo: data.logo ?? brandConfig.logo,
        instagram: data.instagram ?? brandConfig.social.instagram,
        facebook: data.facebook ?? "",
        youtube: data.youtube ?? "",
        pinterest: data.pinterest ?? "",
      });
    }).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <PageShell title="Store Settings" subtitle="Brand information, contact details, and payment methods.">
      <div className="space-y-8 max-w-3xl">
        <div className="bg-white border border-neutral-200 p-8">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-5">Store Info</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.key === "address" ? "md:col-span-2" : ""}>
                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">{f.label}</label>
                <input type="text" value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-center mt-8">
            <button onClick={save} disabled={saving} className="bg-black text-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-xs uppercase tracking-[0.2em] text-green-700">Saved ✓</span>}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <h3 className="font-heading text-lg uppercase tracking-[0.15em] mb-5">Payment Methods</h3>
          <button onClick={() => setFlag("cashOnDelivery", !flags.cashOnDelivery)}
            className="flex items-center justify-between w-full py-3">
            <div className="text-left">
              <p className="text-sm">Cash on Delivery</p>
              <p className="text-xs text-neutral-500 font-light mt-0.5">Show COD as a checkout payment option</p>
            </div>
            <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${flags.cashOnDelivery ? "bg-black" : "bg-neutral-300"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${flags.cashOnDelivery ? "left-5" : "left-0.5"}`} />
            </span>
          </button>
          <p className="text-xs text-neutral-500 italic mt-2">Razorpay is always enabled. COD can be toggled here or in Feature Controls.</p>
        </div>
      </div>
    </PageShell>
  );
}
