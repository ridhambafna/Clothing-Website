"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";
import { brandConfig } from "@/brand.config";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (size: string) => void;
  title?: string;
  productName?: string;
  productId?: string;
  customSizes?: string[];
}

const JEWELLERY_SIZES = ["6", "7", "8", "9", "10"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SizePopup({ open, onClose, onSelect, title, productName, productId, customSizes }: Props) {
  const [askingCustom, setAskingCustom] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const sizes = customSizes && customSizes.length > 0
    ? customSizes
    : brandConfig.type === "jewellery" ? JEWELLERY_SIZES : CLOTHING_SIZES;

  function pickCustomFit() { setAskingCustom(true); }

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_fit",
          name, phone, email,
          productId,
          productName,
          note: `Custom fit request for ${productName || "(no product)"}`,
        }),
      });
      setDone(true);
      // Mark item with size "Custom Fit" so cart knows
      onSelect("Custom Fit");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    onClose();
    setTimeout(() => { setAskingCustom(false); setDone(false); setName(""); setPhone(""); setEmail(""); }, 200);
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center px-4 bg-black/60" onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white p-10">
        <button onClick={close} className="absolute right-4 top-4 hover:opacity-60" aria-label="Close">
          <X className="h-6 w-6 stroke-[1.5] text-[#777]" />
        </button>

        {done ? (
          <div className="text-center py-6">
            <Ruler className="w-10 h-10 mx-auto stroke-[1.5] text-[#C5A572] mb-4" />
            <h3 className="font-heading text-xl uppercase tracking-[0.15em] mb-3">Request Received</h3>
            <p className="text-sm text-[#777] leading-loose">Our team will contact you shortly to take your measurements.</p>
            <button onClick={close} className="mt-6 btn-primary">Close</button>
          </div>
        ) : askingCustom ? (
          <form onSubmit={submitInquiry}>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#777]">Custom Fit</p>
            <h3 className="mb-2 font-heading text-xl uppercase tracking-[0.15em]">Share your contact</h3>
            <p className="mb-6 text-xs text-[#777]">Our team will reach out to take your measurements personally.</p>

            <div className="space-y-3">
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
              <input type="tel" placeholder="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
            </div>

            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setAskingCustom(false)} className="flex-1 border border-[#E8E2D5] py-3 text-xs uppercase tracking-[0.2em]">Back</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
                {submitting ? "Sending..." : "Submit Request"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#777]">Select Size</p>
            <h3 className="mb-2 font-heading text-xl uppercase tracking-[0.15em]">{title ?? "Choose Your Size"}</h3>
            {productName && <p className="mb-8 text-xs text-[#777]">{productName}</p>}

            <div className="mb-4 grid grid-cols-5 gap-2">
              {sizes.map((s) => (
                <button key={s} onClick={() => { onSelect(s); close(); }}
                  className="h-12 border border-[#E8E2D5] text-sm hover:bg-[#0F0F0F] hover:text-white hover:border-[#0F0F0F] transition">
                  {s}
                </button>
              ))}
            </div>

            <button onClick={pickCustomFit}
              className="w-full mb-4 flex items-center justify-center gap-2 border border-[#C5A572] text-[#C5A572] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#C5A572] hover:text-white transition">
              <Ruler className="w-4 h-4" /> Custom Fit
            </button>

            <p className="text-center text-xs text-[#777]">
              Custom fit? <button onClick={pickCustomFit} className="underline">Our team will measure you personally.</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
