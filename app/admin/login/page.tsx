"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { brandConfig } from "@/brand.config";
import { useApp } from "@/contexts/AppContext";

export default function AdminLoginPage() {
  const { loginEmail } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await loginEmail(email, password);
      if (!r.ok) { setError(r.error || "Invalid credentials"); return; }
      if (r.role !== "admin") { setError("This account is not an admin."); return; }
      router.push("/admin");
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-8 bg-[#FDFDFD]">
      <div className="w-full max-w-md border border-neutral-200 bg-white p-12">
        <div className="mb-10 text-center">
          <p className="font-heading text-2xl uppercase tracking-[0.2em]">{brandConfig.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">Admin Access</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black bg-transparent" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-neutral-200 px-4 py-3 pr-10 text-sm font-light outline-none focus:border-black bg-transparent" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-[#8C001A] uppercase tracking-[0.15em]">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-black py-4 text-sm uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
