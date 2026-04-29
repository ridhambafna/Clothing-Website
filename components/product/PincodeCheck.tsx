"use client";

import { useState } from "react";
import { MapPin, Check, X } from "lucide-react";

export default function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);
  const [loading, setLoading] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`/api/pincode/check?code=${encodeURIComponent(pin.trim())}`);
      const data = await r.json();
      if (data.available) {
        setResult({ ok: true, message: `Delivery available in ${data.city || pin} — ${data.deliveryDays || 4} business days` });
      } else {
        setResult({ ok: false, message: "Sorry, we don't deliver to this pincode yet" });
      }
    } catch {
      setResult({ ok: false, message: "Could not check pincode. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-y border-neutral-200 py-6 my-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 stroke-[1.5]" />
        <p className="text-xs uppercase tracking-[0.2em]">Check Delivery</p>
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter 6-digit pincode"
          className="flex-1 border-b border-neutral-300 py-2 text-sm tracking-wide focus:outline-none focus:border-black bg-transparent" />
        <button type="submit" disabled={loading} className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 disabled:opacity-50">
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {result && (
        <div className="mt-3 flex items-start gap-2 text-xs">
          {result.ok ? <Check className="w-4 h-4 text-green-700 mt-0.5 stroke-[2]" /> : <X className="w-4 h-4 text-[#8C001A] mt-0.5 stroke-[2]" />}
          <p className={result.ok ? "text-green-700" : "text-[#8C001A]"}>{result.message}</p>
        </div>
      )}
    </div>
  );
}
