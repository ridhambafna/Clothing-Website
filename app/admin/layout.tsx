"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brandConfig } from "@/brand.config";
import AdminLogout from "@/components/admin/AdminLogout";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Settings, ArrowLeft,
  Users, Image as ImgIcon, BarChart3, Truck, Percent, Megaphone,
  ToggleRight, MessageSquare, Bell,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Collections", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Offers", href: "/admin/offers", icon: Megaphone },
  { label: "Coupons", href: "/admin/coupons", icon: Percent },
  { label: "Delivery", href: "/admin/delivery", icon: Truck },
  { label: "Banners", href: "/admin/banners", icon: ImgIcon },
  { label: "Announcement", href: "/admin/announcement", icon: Bell },

  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Feature Controls", href: "/admin/features", icon: ToggleRight },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin/login")) return <>{children}</>;
  return (
    <div className="flex min-h-screen bg-[#F8F6F2]">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[#E8E2D5] bg-white">
        <div className="border-b border-[#E8E2D5] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#777]">Admin</p>
          <p className="mt-1 font-heading text-lg uppercase tracking-[0.15em]">{brandConfig.name}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition ${active ? "bg-[#0F0F0F] text-[#C5A572]" : "text-[#222] hover:bg-[#F8F6F2]"}`}>
                <Icon className="w-4 h-4 stroke-[1.5]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#E8E2D5] p-3 space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-[#777] hover:bg-[#F8F6F2] transition">
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back to Store
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-10">{children}</main>
    </div>
  );
}
