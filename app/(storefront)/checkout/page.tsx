"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Tag, Check, X, Loader2, Banknote, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";
import { formatINR } from "@/lib/utils";

declare global { interface Window { Razorpay: any; } }

interface FormData { email: string; phone: string; firstName: string; lastName: string; address: string; city: string; state: string; pin: string; }
const INITIAL: FormData = { email: "", phone: "", firstName: "", lastName: "", address: "", city: "", state: "", pin: "" };

interface BuyNowItem { productId: string; name: string; price: number; image: string; size: string; quantity: number; }

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-sm text-neutral-500">Loading...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const { cart, totalPrice, removeFromCart } = useCart();
  const { flags } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";

  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null);
  useEffect(() => {
    if (!isBuyNow) return;
    try {
      const raw = sessionStorage.getItem("lux-buynow");
      if (raw) setBuyNowItem(JSON.parse(raw));
      else router.replace("/cart");
    } catch { router.replace("/cart"); }
  }, [isBuyNow, router]);

  // Effective items + subtotal: either single Buy-Now item or full cart.
  const effectiveItems = isBuyNow && buyNowItem ? [{ id: "buynow", ...buyNowItem }] : cart;
  const effectiveSubtotal = isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalPrice;
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "_form", string>>>({});
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const discount = applied?.discount || 0;
  const finalTotal = Math.max(0, effectiveSubtotal - discount);

  function setField<K extends keyof FormData>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  // Auto-fill city/state when pincode is 6 digits
  useEffect(() => {
    const pin = form.pin.trim();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPinError("");
      return;
    }
    let cancelled = false;
    setPinLoading(true);
    setPinError("");
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const entry = Array.isArray(data) ? data[0] : null;
        if (entry?.Status === "Success" && Array.isArray(entry.PostOffice) && entry.PostOffice.length > 0) {
          const po = entry.PostOffice[0];
          setForm((p) => ({ ...p, city: po.District || po.Block || "", state: po.State || "" }));
        } else {
          setPinError("Pincode not found");
          setForm((p) => ({ ...p, city: "", state: "" }));
        }
      })
      .catch(() => { if (!cancelled) setPinError("Could not look up pincode"); })
      .finally(() => { if (!cancelled) setPinLoading(false); });
    return () => { cancelled = true; };
  }, [form.pin]);

  async function applyPromo() {
    if (!promo.trim()) return;
    setPromoMsg("");
    try {
      const r = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.trim().toUpperCase(), subtotal: effectiveSubtotal }),
      });
      const data = await r.json();
      if (!r.ok || !data.valid) { setApplied(null); setPromoMsg(data.error || "Invalid code"); return; }
      setApplied({ code: data.code, discount: data.discount });
      setPromoMsg(`Saved ${formatINR(data.discount)}`);
    } catch { setPromoMsg("Could not apply code"); }
  }

  function removePromo() { setApplied(null); setPromo(""); setPromoMsg(""); }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@gmail\.com$/i.test(form.email.trim())) e.email = "Only @gmail.com addresses are accepted";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.pin.trim()) e.pin = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pin.trim())) e.pin = "Enter a 6-digit PIN code";
    if (!form.city.trim()) e.city = "City required (auto-filled from PIN)";
    if (!form.state.trim()) e.state = "State required (auto-filled from PIN)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function clearBuyNowAndCart() {
    if (!isBuyNow || !buyNowItem) return;
    try { sessionStorage.removeItem("lux-buynow"); } catch {}
    // If the bought item also exists in the user's cart (same product+size), remove it.
    const dup = cart.find((c) => c.productId === buyNowItem.productId && c.size === buyNowItem.size);
    if (dup) removeFromCart(dup.id);
  }

  async function placeOrder() {
    if (!validate()) return;
    if (effectiveItems.length === 0) { alert("Your bag is empty."); return; }
    setLoading(true);
    try {
      const orderBody = {
        customer: { name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone },
        items: effectiveItems.map((c) => ({ productId: c.productId, name: c.name, price: c.price, size: c.size, quantity: c.quantity, image: c.image })),
        address: { line1: form.address, city: form.city, state: form.state, pincode: form.pin },
        subtotal: effectiveSubtotal,
        discount,
        couponCode: applied?.code,
        total: finalTotal,
        paymentMethod,
        status: paymentMethod === "cod" ? "processing" : "pending",
        paymentStatus: "pending",
      };

      if (paymentMethod === "cod") {
        const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderBody) });
        if (!r.ok) { const d = await r.json().catch(() => ({})); alert(d.error || "Failed to place order"); return; }
        clearBuyNowAndCart();
        alert(`Order placed! You will pay ${formatINR(finalTotal)} on delivery.`);
        router.push("/account");
        return;
      }

      const r = await fetch("/api/payment/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const data = await r.json();
      if (!data.id) throw new Error("Failed to create payment order");
      const opt = {
        key: brandConfig.razorpay.keyId,
        amount: data.amount, currency: data.currency,
        name: brandConfig.name, description: "Millazo Order",
        order_id: data.id,
        prefill: { name: `${form.firstName} ${form.lastName}`, email: form.email, contact: form.phone },
        theme: { color: "#C5A572" },
        handler: async (resp: any) => {
          await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...orderBody, paymentStatus: "done", razorpayOrderId: data.id, razorpayPaymentId: resp.razorpay_payment_id }) });
          clearBuyNowAndCart();
          alert("Payment successful! Your order has been placed.");
          router.push("/account");
        },
      };
      new window.Razorpay(opt).open();
    } catch (e) { console.error(e); alert("Could not initiate payment."); }
    finally { setLoading(false); }
  }

  const fc = "w-full border bg-transparent px-4 py-3 text-sm font-light tracking-wide outline-none focus:border-black border-neutral-200";
  const fcErr = "border-[#8C001A]";
  const lc = "mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-7xl px-8 py-16">
        <Link href={isBuyNow ? "/" : "/cart"} className="mb-12 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition">
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" /> {isBuyNow ? "Back" : "Back to Bag"}
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h2 className="mb-8 font-heading text-lg uppercase tracking-[0.15em]">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Email (Gmail only) *</label>
                  <input name="email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@gmail.com" className={`${fc} ${errors.email ? fcErr : ""}`} />
                  {errors.email && <p className="text-xs text-[#8C001A] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={lc}>Phone *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={`${fc} ${errors.phone ? fcErr : ""}`} />
                  {errors.phone && <p className="text-xs text-[#8C001A] mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-8 font-heading text-lg uppercase tracking-[0.15em]">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>First Name *</label>
                    <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={`${fc} ${errors.firstName ? fcErr : ""}`} />
                    {errors.firstName && <p className="text-xs text-[#8C001A] mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className={lc}>Last Name *</label>
                    <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={`${fc} ${errors.lastName ? fcErr : ""}`} />
                    {errors.lastName && <p className="text-xs text-[#8C001A] mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className={lc}>Address *</label>
                  <input value={form.address} onChange={(e) => setField("address", e.target.value)} className={`${fc} ${errors.address ? fcErr : ""}`} />
                  {errors.address && <p className="text-xs text-[#8C001A] mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className={lc}>PIN Code * <span className="text-neutral-400 normal-case tracking-normal">(6 digits, city/state auto-fill)</span></label>
                  <div className="relative">
                    <input value={form.pin} onChange={(e) => setField("pin", e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      inputMode="numeric" maxLength={6} className={`${fc} ${errors.pin || pinError ? fcErr : ""}`} />
                    {pinLoading && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />}
                  </div>
                  {errors.pin && <p className="text-xs text-[#8C001A] mt-1">{errors.pin}</p>}
                  {pinError && !errors.pin && <p className="text-xs text-[#8C001A] mt-1">{pinError}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>City (auto-filled)</label>
                    <input value={form.city} readOnly className={`${fc} bg-neutral-50 text-neutral-600`} />
                    {errors.city && <p className="text-xs text-[#8C001A] mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className={lc}>State (auto-filled)</label>
                    <input value={form.state} readOnly className={`${fc} bg-neutral-50 text-neutral-600`} />
                    {errors.state && <p className="text-xs text-[#8C001A] mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>
            </div>

            {flags.promoCodeAtCheckout && (
              <div>
                <h2 className="mb-4 font-heading text-lg uppercase tracking-[0.15em] flex items-center gap-2">
                  <Tag className="w-5 h-5 stroke-[1.5]" /> Promo Code <span className="text-xs text-neutral-400 normal-case tracking-normal font-sans">(optional)</span>
                </h2>
                {applied ? (
                  <div className="flex items-center justify-between border border-green-300 bg-green-50 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 text-green-800">
                      <Check className="w-4 h-4 stroke-[2]" /> <span className="font-mono">{applied.code}</span> applied — {formatINR(applied.discount)} off
                    </span>
                    <button onClick={removePromo} className="text-neutral-500 hover:text-black"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="Enter code" className={`${fc} flex-1 uppercase font-mono`} />
                    <button onClick={applyPromo} className="px-6 border border-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition">Apply</button>
                  </div>
                )}
                {promoMsg && !applied && <p className="text-xs text-[#8C001A] mt-2">{promoMsg}</p>}
              </div>
            )}

            <div>
              <h2 className="mb-4 font-heading text-lg uppercase tracking-[0.15em]">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod("razorpay")} type="button"
                  className={`flex items-center gap-3 p-4 border text-left transition ${paymentMethod === "razorpay" ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                  <CreditCard className="w-5 h-5 stroke-[1.5]" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.15em]">Razorpay</p>
                    <p className="text-xs text-neutral-500 font-light">Card / UPI / Netbanking</p>
                  </div>
                </button>
                {flags.cashOnDelivery && (
                  <button onClick={() => setPaymentMethod("cod")} type="button"
                    className={`flex items-center gap-3 p-4 border text-left transition ${paymentMethod === "cod" ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                    <Banknote className="w-5 h-5 stroke-[1.5]" />
                    <div>
                      <p className="text-sm uppercase tracking-[0.15em]">Cash on Delivery</p>
                      <p className="text-xs text-neutral-500 font-light">Pay when your piece arrives</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <button onClick={placeOrder} disabled={loading || effectiveItems.length === 0}
              className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
              {loading ? "Processing..." : paymentMethod === "cod" ? `Place Order — ${formatINR(finalTotal)}` : `Pay Securely — ${formatINR(finalTotal)}`}
            </button>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start border border-neutral-200 p-8">
            <h2 className="mb-8 text-sm uppercase tracking-[0.2em]">
              {isBuyNow ? "Buy Now — Single Item" : "Order Summary"}
            </h2>
            <div className="space-y-6 mb-8">
              {effectiveItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] text-white">{item.quantity}</span>
                  </div>
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <p className="font-heading text-xs uppercase tracking-[0.15em]">{item.name}</p>
                      <p className="text-xs text-neutral-500">Size {item.size}</p>
                    </div>
                    <p className="text-sm">{formatINR(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-6 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span>{formatINR(effectiveSubtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-700"><span>Discount ({applied?.code})</span><span>− {formatINR(discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-neutral-500">Shipping</span><span className="uppercase tracking-[0.1em]">Complimentary</span></div>
              <div className="flex justify-between border-t border-neutral-200 pt-4">
                <span className="text-sm uppercase tracking-[0.2em]">Total</span>
                <span className="text-lg">{formatINR(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
