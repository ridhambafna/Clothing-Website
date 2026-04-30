"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DEFAULT_FLAGS, FeatureFlags, FlagKey } from "@/lib/feature-flags";

interface AppContextType {
  flags: FeatureFlags;
  setFlag: (key: FlagKey, value: boolean) => Promise<void>;
  refreshFlags: () => Promise<void>;
  authPopupOpen: boolean;
  openAuthPopup: () => void;
  closeAuthPopup: () => void;
  user: { id: string; email: string; name?: string; role: "user" | "admin" } | null;
  setUser: (u: AppContextType["user"]) => void;
  loginEmail: (email: string, password: string) => Promise<{ ok: boolean; role?: string; error?: string }>;
  signupEmail: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children, initialFlags }: { children: React.ReactNode; initialFlags?: Partial<FeatureFlags> }) {
  const [flags, setFlags] = useState<FeatureFlags>({ ...DEFAULT_FLAGS, ...(initialFlags || {}) });
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [user, setUser] = useState<AppContextType["user"]>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [popupShownThisSession, setPopupShownThisSession] = useState(false);

  const refreshFlags = useCallback(async () => {
    try {
      const r = await fetch("/api/flags", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setFlags({ ...DEFAULT_FLAGS, ...data });
      }
    } catch {}
  }, []);

  const setFlag = useCallback(async (key: FlagKey, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }));
    try {
      await fetch("/api/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {}
  }, []);

  useEffect(() => {
    refreshFlags();
    try {
      const saved = sessionStorage.getItem("lux-user");
      if (saved) setUser(JSON.parse(saved));
      const dismissed = sessionStorage.getItem("lux-auth-popup-dismissed");
      if (dismissed === "1") setPopupShownThisSession(true);
    } catch {}
    setIsMounted(true);
  }, [refreshFlags]);

  useEffect(() => {
    if (!isMounted) return;
    if (user) {
      try { sessionStorage.setItem("lux-user", JSON.stringify(user)); } catch {}
    } else {
      try { sessionStorage.removeItem("lux-user"); } catch {}
    }
  }, [user, isMounted]);

  // Auto-open after 10s if flag on, no user, not yet shown, and NOT on admin panel
  useEffect(() => {
    if (!flags.autoAuthPopup) return;
    if (user) return;
    if (popupShownThisSession) return;
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return;
    
    const t = setTimeout(() => {
      if (!user && !(typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))) {
        setAuthPopupOpen(true);
        setPopupShownThisSession(true);
      }
    }, 10000);
    return () => clearTimeout(t);
  }, [flags.autoAuthPopup, user, popupShownThisSession]);

  const openAuthPopup = useCallback(() => setAuthPopupOpen(true), []);
  const closeAuthPopup = useCallback(() => {
    setAuthPopupOpen(false);
    setPopupShownThisSession(true);
    try { sessionStorage.setItem("lux-auth-popup-dismissed", "1"); } catch {}
  }, []);

  const loginEmail = useCallback(async (email: string, password: string) => {
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || "Login failed" };
      setUser(data.user);
      return { ok: true, role: data.user.role };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Login failed" };
    }
  }, []);

  const signupEmail = useCallback(async (name: string, email: string, password: string) => {
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || "Signup failed" };
      setUser(data.user);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Signup failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
  }, []);

  return (
    <AppContext.Provider value={{ flags, setFlag, refreshFlags, authPopupOpen, openAuthPopup, closeAuthPopup, user, setUser, loginEmail, signupEmail, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function useFlag(key: FlagKey) {
  const { flags } = useApp();
  return flags[key];
}
