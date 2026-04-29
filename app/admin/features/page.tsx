"use client";

import { useApp } from "@/contexts/AppContext";
import { FLAG_GROUPS, FLAG_LABELS, FlagKey } from "@/lib/feature-flags";
import PageShell from "@/components/admin/PageShell";

export default function FeaturesPage() {
  const { flags, setFlag } = useApp();

  return (
    <PageShell title="Feature Controls" subtitle="Toggle features on/off across your storefront. Changes take effect immediately.">
      <div className="space-y-10">
        {Object.entries(FLAG_GROUPS).map(([key, group]) => (
          <section key={key}>
            <h2 className="font-heading text-lg uppercase tracking-[0.15em] mb-5 pb-2 border-b border-neutral-200">{group.label}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {group.flags.map((f) => (
                <Toggle key={f} flag={f} label={FLAG_LABELS[f]} value={flags[f]} onChange={(v) => setFlag(f, v)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function Toggle({ label, value, onChange }: { flag: FlagKey; label: string; value: boolean; onChange: (v: boolean) => void; }) {
  return (
    <button onClick={() => onChange(!value)}
      className="flex items-center justify-between border border-neutral-200 bg-white px-5 py-4 hover:border-black transition text-left">
      <span className="text-sm">{label}</span>
      <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${value ? "bg-black" : "bg-neutral-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-5" : "left-0.5"}`} />
      </span>
    </button>
  );
}
