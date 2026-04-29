"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

export default function AuthPopup() {
  const { authPopupOpen, closeAuthPopup, loginEmail, signupEmail, logout } = useApp();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!authPopupOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = tab === "login"
        ? await loginEmail(email, password)
        : await signupEmail(name, email, password);
      if (!r.ok) {
        setError(r.error || "Something went wrong");
        return;
      }
      // Admin accounts must use the hidden /admin/login route, not this popup
      if (tab === "login" && (r as any).role === "admin") {
        await logout();
        setError("Invalid credentials");
        return;
      }
      closeAuthPopup();
      setName(""); setEmail(""); setPassword("");
      router.push("/account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeAuthPopup}>
      <div className="relative w-full max-w-md bg-white p-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={closeAuthPopup} className="absolute top-4 right-4 text-neutral-500 hover:text-black" aria-label="Close">
          <X className="w-6 h-6 stroke-[1.5]" />
        </button>
        <div className="mb-8 text-center">
          <p className="text-2xl uppercase tracking-[0.2em] font-heading">{brandConfig.name}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
            {tab === "login" ? "Welcome Back" : "Join Millazo"}
          </p>
        </div>
        <div className="mb-8 flex border-b border-neutral-200">
          {(["login","signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 pb-3 text-xs uppercase tracking-[0.25em] -mb-px ${tab === t ? "text-black border-b border-black" : "text-neutral-500"}`}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-5">
          {tab === "signup" && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border-b border-neutral-300 py-3 text-sm font-light tracking-wide focus:outline-none focus:border-black bg-transparent" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border-b border-neutral-300 py-3 text-sm font-light tracking-wide focus:outline-none focus:border-black bg-transparent" />
          <input type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full border-b border-neutral-300 py-3 text-sm font-light tracking-wide focus:outline-none focus:border-black bg-transparent" />
          {error && <p className="text-sm text-[#8C001A] tracking-wide">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
