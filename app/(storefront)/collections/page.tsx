"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { brandConfig } from "@/brand.config";

interface Collection { _id?: string; name: string; slug: string; image?: string; description?: string; }

export default function CollectionsIndexPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Jewellery-era subcategory slugs that should never appear in the clothing store
  const LEGACY_JEWELLERY_SLUGS = new Set([
    "rings", "necklaces", "earrings", "bangles", "anklets", "bracelets",
    "pendants", "chains", "studs", "hoops",
  ]);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Collection[]) => {
        // Only show admin-created collections. If DB is empty, fall back to brand.config
        // collections (Shirting / Kurta / Linen) — never the legacy jewellery seed.
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data.filter((c) => !LEGACY_JEWELLERY_SLUGS.has(c.slug)));
        } else {
          setCollections(brandConfig.content.collections);
        }
      })
      .catch(() => setCollections(brandConfig.content.collections))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-8 py-20">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">{brandConfig.name}</p>
        <h1 className="font-heading text-5xl uppercase tracking-[0.15em]">Explore Collections</h1>
        <p className="mt-6 max-w-md mx-auto text-sm leading-loose text-neutral-500 font-light">
          Curated edits, hand-finished by our master artisans.
        </p>
      </div>

      {!loaded ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-heading text-xl uppercase tracking-[0.2em] text-neutral-500">No collections yet</p>
          <p className="text-sm text-neutral-400 mt-3 font-light">Add collections from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {collections.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
              <div className="aspect-[4/5] overflow-hidden mb-5 bg-neutral-100">
                {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />}
              </div>
              <p className="font-heading text-xl uppercase tracking-[0.2em] text-center">{c.name}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 text-center mt-2 group-hover:text-black transition">Discover →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
