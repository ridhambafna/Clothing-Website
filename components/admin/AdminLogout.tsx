"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function AdminLogout() {
  const { logout } = useApp();
  const router = useRouter();
  return (
    <button
      onClick={async () => { await logout(); router.push("/admin/login"); }}
      className="flex w-full items-center gap-3 rounded px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-[#8C001A] hover:bg-red-50 transition"
    >
      <LogOut className="w-4 h-4 stroke-[1.5]" /> Logout
    </button>
  );
}
