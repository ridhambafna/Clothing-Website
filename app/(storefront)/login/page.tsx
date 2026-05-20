"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-sm text-neutral-500 font-light">Loading Portal...</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { user, loginEmail, signupEmail } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-700"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "signup") {
        if (!name.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        if (strength < 3) {
          setError("Please use a stronger password");
          setLoading(false);
          return;
        }
        const res = await signupEmail(name, email, password);
        if (!res.ok) {
          setError(res.error || "Signup failed");
          setLoading(false);
          return;
        }
      } else {
        const res = await loginEmail(email, password);
        if (!res.ok) {
          setError(res.error || "Invalid credentials");
          setLoading(false);
          return;
        }
      }
      
      // router.replace is handled by the useEffect above once user state changes,
      // but let's do a fallback replace just in case.
      router.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border-b border-[#E8E2D5] bg-transparent py-3 text-sm font-light tracking-wide outline-none focus:border-black transition-colors placeholder:text-neutral-400";
  const labelClass = "block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1";

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: Premium High-Fashion Imagery (Hidden on mobile) */}
      <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-[#F8F6F2]">
        <img 
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop" 
          alt="Millazo Campaign" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.95] contrast-[1.02]" 
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-16 left-12 right-12 text-white z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] mb-3 text-white/90">{brandConfig.tagline}</p>
          <h2 className="font-heading text-3xl uppercase tracking-[0.1em] mb-4 leading-snug">
            Timeless Design,<br />Uncompromised Quality
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A572] mb-4" />
          <p className="text-xs text-white/80 font-light leading-relaxed max-w-sm">
            Welcome to Millazo. Sign in to access your curated collections, bespoke tailors, and complimentary expedited shipping.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In / Registration Form */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-16">
        <div className="max-w-md w-full mx-auto">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black mb-12 transition">
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back to Boutique
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-heading text-3xl uppercase tracking-[0.15em] text-black mb-2">{brandConfig.name}</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A572] font-light">
              {tab === "login" ? "Bespoke Wardrobe Portal" : "Create Master Account"}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#E8E2D5] mb-8">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 pb-3 text-xs uppercase tracking-[0.2em] -mb-px transition-all font-light ${tab === "login" ? "text-black border-b-2 border-black font-normal" : "text-neutral-400 hover:text-neutral-700"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 pb-3 text-xs uppercase tracking-[0.2em] -mb-px transition-all font-light ${tab === "signup" ? "text-black border-b-2 border-black font-normal" : "text-neutral-400 hover:text-neutral-700"}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {tab === "signup" && (
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Alexander Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>

              {tab === "signup" && password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= s ? strengthColors[strength] : "bg-neutral-100"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1.5 font-light">
                    Strength: <span className="font-medium">{strengthLabels[strength]}</span> (use capitals, digits, specials)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs uppercase tracking-[0.1em] text-[#8C001A] bg-red-50/50 border border-red-100 px-4 py-3 text-center font-light">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === "login" ? "Sign In to Wardrobe" : "Register Account"}
            </button>
          </form>

          <p className="mt-8 text-[11px] text-center text-neutral-400 font-light leading-relaxed">
            By accessing your bespoke profile, you agree to our <br />
            <Link href="/p/privacy-policy" className="underline hover:text-black transition">Privacy Policy</Link> and <Link href="/p/terms-of-service" className="underline hover:text-black transition">Terms of Boutique</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
