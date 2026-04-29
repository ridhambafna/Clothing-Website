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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black bg-transparent" />
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
