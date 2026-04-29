"use client";

import PageShell from "@/components/admin/PageShell";
import { useApp } from "@/contexts/AppContext";
import { FlagKey } from "@/lib/feature-flags";

const SECTIONS: { sectionFlag: FlagKey; title: string; links: { flag: FlagKey; label: string }[] }[] = [
  {
    sectionFlag: "footerCustomerCare",
    title: "Customer Care",
    links: [
      { flag: "fl_contact", label: "Contact Us" },
      { flag: "fl_faq", label: "FAQ" },
      { flag: "fl_shipping", label: "Shipping & Returns" },
      { flag: "fl_sizeGuide", label: "Size Guide" },
      { flag: "fl_orderStatus", label: "Order Status" },
    ],
  },
  {
    sectionFlag: "footerOurCompany",
    title: "Our Company",
    links: [
      { flag: "fl_about", label: "About Us" },
      { flag: "fl_sustainability", label: "Sustainability" },
      { flag: "fl_careers", label: "Careers" },
      { flag: "fl_press", label: "Press" },
    ],
  },
  {
    sectionFlag: "footerLegal",
    title: "Legal",
    links: [
      { flag: "fl_privacy", label: "Privacy Policy" },
      { flag: "fl_terms", label: "Terms of Service" },
      { flag: "fl_cookies", label: "Cookie Policy" },
      { flag: "fl_accessibility", label: "Accessibility" },
    ],
  },
];

export default function FooterAdminPage() {
  const { flags, setFlag } = useApp();

  return (
    <PageShell title="Footer Management" subtitle="Toggle each section and individual link. Changes are live immediately.">
      <div className="space-y-8 max-w-3xl">
        <Toggle label="Show Social Icons Column" value={flags.footerSocial} onChange={(v) => setFlag("footerSocial", v)} />
        {SECTIONS.map((s) => (
          <div key={s.sectionFlag} className="border border-neutral-200 bg-white p-6">
            <Toggle label={`Show "${s.title}" Section`} value={!!flags[s.sectionFlag]} onChange={(v) => setFlag(s.sectionFlag, v)} bold />
            <div className="mt-5 pl-4 border-l-2 border-neutral-100 space-y-2">
              {s.links.map((l) => (
                <Toggle key={l.flag} label={l.label} value={!!flags[l.flag]} onChange={(v) => setFlag(l.flag, v)} small disabled={!flags[s.sectionFlag]} />
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-neutral-500 italic">
          Tip: link labels and URLs are managed in <a href="/admin/pages" className="underline">Pages & SEO</a> for now.
        </p>
      </div>
    </PageShell>
  );
}

function Toggle({ label, value, onChange, bold, small, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; bold?: boolean; small?: boolean; disabled?: boolean }) {
  return (
    <button onClick={() => !disabled && onChange(!value)} disabled={disabled}
      className={`flex items-center justify-between w-full ${disabled ? "opacity-40" : ""} ${small ? "py-2" : "py-3"}`}>
      <span className={`text-sm ${bold ? "font-medium uppercase tracking-[0.15em]" : ""}`}>{label}</span>
      <span className={`relative inline-flex flex-shrink-0 rounded-full transition ${small ? "h-5 w-9" : "h-6 w-11"} ${value ? "bg-black" : "bg-neutral-300"}`}>
        <span className={`absolute top-0.5 rounded-full bg-white transition ${small ? "h-4 w-4" : "h-5 w-5"} ${value ? (small ? "left-4" : "left-5") : "left-0.5"}`} />
      </span>
    </button>
  );
}
