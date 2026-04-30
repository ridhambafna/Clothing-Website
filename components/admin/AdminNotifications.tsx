"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ lowStock: any[], recentOrders: any[] }>({ lowStock: [], recentOrders: [] });

  useEffect(() => {
    fetch("/api/analytics?range=7d").then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setData({ lowStock: d.lowStock || [], recentOrders: d.recentOrders || [] });
      }
    });
  }, []);

  const total = data.lowStock.length + data.recentOrders.length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-neutral-500 hover:text-black transition">
        <Bell className="w-5 h-5 stroke-[1.5]" />
        {total > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
      </button>
      
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-neutral-200 shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-sm uppercase tracking-[0.1em]">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:text-black">Close</button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {total === 0 && <p className="text-xs text-neutral-500">No new notifications.</p>}
            
            {data.recentOrders.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 border-b border-neutral-100 pb-1">New Orders</p>
                {data.recentOrders.slice(0, 5).map(o => (
                  <Link key={o._id} href={`/admin/orders/${o._id}`} className="block py-2 text-xs hover:bg-neutral-50">
                    <span className="font-mono text-[#C5A572]">#{o._id.slice(-8).toUpperCase()}</span> - {o.customer}
                  </Link>
                ))}
              </div>
            )}
            
            {data.lowStock.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 border-b border-neutral-100 pb-1">Low Stock Alerts</p>
                {data.lowStock.map(p => (
                  <div key={p._id} className="py-2 text-xs text-red-600">
                    {p.name} - Only {p.stock} left
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
