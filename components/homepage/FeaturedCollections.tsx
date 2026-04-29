"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

interface Col { name: string; slug: string; image?: string; }

export default function FeaturedCollections() {
  const { flags } = useApp();
  const [collections, setCollections] = useState<Col[]>(brandConfig.content.collections);

  const LEGACY_SLUGS = new Set(["rings","necklaces","earrings","bangles","anklets","bracelets","pendants","chains","studs","hoops"]);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const onHome = data.filter((c) => c.showOnHome !== false && !LEGACY_SLUGS.has(c.slug));
        if (onHome.length > 0) setCollections(onHome.map((c) => ({ name: c.name, slug: c.slug, image: c.image })));
      })
      .catch(() => {});
  }, []);

  if (!flags.featuredCollections) return null;

  return (
    <section className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">Our Collections</p>
        <h2 className="font-heading text-4xl uppercase tracking-[0.15em]">The Edit</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {collections.map((col, idx) => (
          <Link key={col.slug} href={`/collections/${col.slug}`}
            className={`group relative block overflow-hidden ${idx === 1 ? "md:mt-16" : ""}`}>
            <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
              {col.image && <img src={col.image} alt={col.name} className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-heading text-sm uppercase tracking-[0.2em]">{col.name}</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100">Discover →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
