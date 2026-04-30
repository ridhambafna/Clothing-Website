"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

function RequestsInner() {
  const { user } = useApp();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const type = searchParams.get("type"); // "cancel" or "return"
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return <div className="py-32 text-center">Please sign in to view this page.</div>;
  }

  if (!orderId || !type) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-32 text-center">
        <p className="text-sm text-[#777]">Invalid request.</p>
        <Link href="/account" className="mt-4 inline-block text-xs uppercase tracking-[0.2em] underline hover:text-black">Back to Account</Link>
      </div>
    );
  }

  const isReturn = type === "return";
  const title = isReturn ? "Return Request" : "Cancellation Request";
  
  const returnReasons = [
    "Size doesn't fit",
    "Item damaged or defective",
    "Different from image/description",
    "Changed my mind",
    "Other",
  ];

  const cancelReasons = [
    "Ordered by mistake",
    "Found a better price elsewhere",
    "Delivery is taking too long",
    "Changed my mind",
    "Other",
  ];

  const reasons = isReturn ? returnReasons : cancelReasons;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return setError("Please select a reason");
    
    setLoading(true);
    setError("");
    
    try {
      // Create an inquiry or special request
      const r = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isReturn ? "return_request" : "cancellation_request",
          name: user!.name || user!.email,
          email: user!.email,
          phone: "N/A",
          productName: `Order #${orderId.slice(-8).toUpperCase()}`,
          message: `Reason: ${reason}\n\nDetails: ${details}`,
        }),
      });
      
      if (!r.ok) {
        throw new Error("Failed to submit request");
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-8 py-32 text-center">
        <h1 className="font-heading text-3xl uppercase tracking-[0.15em] mb-4">Request Submitted</h1>
        <p className="text-sm text-neutral-500 mb-8 font-light leading-relaxed">
          We have received your {isReturn ? "return" : "cancellation"} request for Order <span className="font-mono text-black">#{orderId.slice(-8).toUpperCase()}</span>. 
          Our team will review it and get back to you within 24-48 hours.
        </p>
        <Link href="/account" className="bg-black text-white px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition">
          Back to My Account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <Link href="/account" className="mb-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition">
        <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back to Orders
      </Link>
      
      <div className="mb-8 border-b border-neutral-200 pb-8">
        <h1 className="font-heading text-3xl uppercase tracking-[0.15em]">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500 font-light">Order <span className="font-mono text-black">#{orderId.slice(-8).toUpperCase()}</span></p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-neutral-500">Reason for {isReturn ? "Return" : "Cancellation"} *</label>
          <div className="space-y-2">
            {reasons.map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer p-3 border border-neutral-200 hover:border-black transition">
                <input 
                  type="radio" 
                  name="reason" 
                  value={r} 
                  checked={reason === r} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-neutral-500">Additional Details (Optional)</label>
          <textarea 
            value={details} 
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black"
            placeholder={`Please provide any extra information...`}
          />
        </div>

        {isReturn && (
          <div className="bg-[#F8F6F2] p-4 border border-[#E8E2D5]">
            <p className="text-xs font-light text-neutral-600 leading-relaxed">
              <strong className="font-medium text-black">Note:</strong> Returns are only accepted within 30 days of delivery. Items must be unused, unwashed, and retain all original tags and packaging.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-[#8C001A]">{error}</p>}

        <button 
          type="submit" 
          disabled={loading || !reason}
          className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <RequestsInner />
    </Suspense>
  );
}
