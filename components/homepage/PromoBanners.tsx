"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Banner { _id: string; title?: string; subtitle?: string; image?: string; link?: string; active?: boolean; }

export default function PromoBanners() {
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => {
    fetch("/api/banner-list", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Banner[]) => setItems(data.filter((b) => b.active !== false && b.image)))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-16 px-8">
      <div className="max-w-7xl mx-auto grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))` }}>
        {items.slice(0, 6).map((b) => {
          const Wrap: any = b.link ? Link : "div";
          const wrapProps = b.link ? { href: b.link } : {};
          return (
            <Wrap key={b._id} {...wrapProps} className="group relative block overflow-hidden aspect-[4/3]">
              <img src={b.image} alt={b.title || ""} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              {(b.title || b.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent flex flex-col items-center justify-end pb-10 text-center">
                  {b.subtitle && <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-2">{b.subtitle}</p>}
                  {b.title && <h3 className="font-heading text-2xl uppercase tracking-[0.2em] text-white">{b.title}</h3>}
                </div>
              )}
            </Wrap>
          );
        })}
      </div>
    </section>
  );
}
