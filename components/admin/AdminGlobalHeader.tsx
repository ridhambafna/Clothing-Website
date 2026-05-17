"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function AdminGlobalHeader() {
  const [newOrders, setNewOrders] = useState(0);
  const [newInquiries, setNewInquiries] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const [ordersRes, inquiriesRes] = await Promise.all([
          fetch("/api/orders", { cache: "no-store" }),
          fetch("/api/inquiries", { cache: "no-store" }),
        ]);
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setNewOrders(orders.filter((o: any) => o.status === "pending").length);
        }
        if (inquiriesRes.ok) {
          const inquiries = await inquiriesRes.json();
          setNewInquiries(inquiries.filter((i: any) => i.status === "new").length);
        }
      } catch {}
    }
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  const total = newOrders + newInquiries;

  return (
    <header className="flex h-16 items-center justify-end border-b border-[#E8E2D5] bg-white px-10 relative">
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative p-2 text-neutral-500 hover:text-black">
          <Bell className="w-5 h-5 stroke-[1.5]" />
          {total > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8C001A] text-[9px] text-white">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-72 border border-[#E8E2D5] bg-white p-4 shadow-lg z-50">
            <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Notifications</h3>
            {total === 0 ? (
              <p className="text-sm font-light text-neutral-400">All caught up!</p>
            ) : (
              <div className="space-y-3">
                {newOrders > 0 && (
                  <Link href="/admin/orders" onClick={() => setOpen(false)} className="block border border-neutral-100 p-3 hover:bg-neutral-50">
                    <p className="text-sm text-black">{newOrders} New Order{newOrders > 1 ? "s" : ""}</p>
                    <p className="mt-1 text-xs text-neutral-500">Action required</p>
                  </Link>
                )}
                {newInquiries > 0 && (
                  <Link href="/admin/inquiries" onClick={() => setOpen(false)} className="block border border-neutral-100 p-3 hover:bg-neutral-50">
                    <p className="text-sm text-black">{newInquiries} New Inquiry{newInquiries > 1 ? "ies" : ""}</p>
                    <p className="mt-1 text-xs text-neutral-500">Action required</p>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
