"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Product } from "@/lib/mock-data";
import { useApp } from "@/contexts/AppContext";

interface Section { key: string; title: string; flag: keyof ReturnType<typeof useApp>["flags"]; render: () => React.ReactNode; }

export default function ProductAccordions({ product }: { product: Product }) {
  const { flags } = useApp();
  const [open, setOpen] = useState<string | null>(null);

  const sections: Section[] = [
    {
      key: "desc", title: "Description", flag: "accordionDescription",
      render: () => <p className="text-sm font-light leading-loose text-neutral-600">{product.description}</p>,
    },
    {
      key: "supplier", title: "Supplier Information", flag: "accordionSupplier",
      render: () => <p className="text-sm font-light leading-loose text-neutral-600">{product.supplier || "Hand-crafted in our atelier."}</p>,
    },
    {
      key: "returns", title: "Returns & Exchange Policy", flag: "accordionReturns",
      render: () => (
        <div className="space-y-2 text-sm font-light leading-loose text-neutral-600">
          <p>30-day returns on all unworn pieces in original packaging.</p>
          <p>Complimentary exchanges for size or style.</p>
          <p>Returns must be initiated within 30 days of delivery.</p>
        </div>
      ),
    },
  ];

  const visible = sections.filter((s) => flags[s.flag as keyof typeof flags]);

  return (
    <div className="border-t border-neutral-200 mt-12">
      {visible.map((s) => (
        <div key={s.key} className="border-b border-neutral-200">
          <button onClick={() => setOpen(open === s.key ? null : s.key)}
            className="w-full flex items-center justify-between py-5 text-sm uppercase tracking-[0.2em]">
            <span>{s.title}</span>
            {open === s.key ? <Minus className="w-5 h-5 stroke-[1.5]" /> : <Plus className="w-5 h-5 stroke-[1.5]" />}
          </button>
          {open === s.key && <div className="pb-6">{s.render()}</div>}
        </div>
      ))}
    </div>
  );
}
