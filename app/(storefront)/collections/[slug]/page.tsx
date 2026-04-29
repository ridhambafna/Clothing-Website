"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/mock-data";
import { fetchProducts } from "@/lib/products-client";
import { brandConfig } from "@/brand.config";
import ProductCard from "@/components/listing/ProductCard";
import FilterSortBar, { DEFAULT_FILTERS, type SortKey, type Filters } from "@/components/listing/FilterSortBar";
import { useApp } from "@/contexts/AppContext";

interface Props { params: Promise<{ slug: string }>; }

export default function CollectionPage({ params }: Props) {
  const { slug } = use(params);
  const { flags } = useApp();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("newest");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<{ name: string; productIds?: string[]; description?: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { fetchProducts().then(setAllProducts); }, []);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const match = data.find((c) => c.slug === slug);
        if (match) setCollection({ name: match.name, productIds: Array.isArray(match.productIds) ? match.productIds : [], description: match.description });
        else {
          const fb = brandConfig.content.collections.find((c) => c.slug === slug);
          setCollection({ name: fb?.name || slug.charAt(0).toUpperCase() + slug.slice(1), productIds: undefined });
        }
      })
      .catch(() => setCollection({ name: slug.charAt(0).toUpperCase() + slug.slice(1) }))
      .finally(() => setLoaded(true));
  }, [slug]);

  const collectionProducts = useMemo(() => {
    if (!collection) return [];
    // If admin has assigned product IDs, ONLY show those (Section 12).
    if (Array.isArray(collection.productIds) && collection.productIds.length > 0) {
      const idSet = new Set(collection.productIds);
      return allProducts.filter((p) => idSet.has(String(p._id)));
    }
    // Fallback to category/collection slug match (legacy behaviour for unmigrated collections)
    return allProducts.filter((p) => p.category === slug || p.collection === slug);
  }, [collection, allProducts, slug]);

  const filtered = useMemo(() => {
    let items = [...collectionProducts];
    if (filters.metals.length) items = items.filter((p) => filters.metals.includes(p.metal));
    if (filters.stones.length) items = items.filter((p) => filters.stones.includes(p.stone));
    if (filters.collections.length) items = items.filter((p) => p.collection && filters.collections.includes(p.collection));
    if (filters.inStockOnly) items = items.filter((p) => p.inStock);
    items = items.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);
    switch (sort) {
      case "price-asc": items = [...items].sort((a, b) => a.price - b.price); break;
      case "price-desc": items = [...items].sort((a, b) => b.price - a.price); break;
      case "bestseller": items = [...items].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)); break;
      default: items = [...items].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
    }
    return items;
  }, [collectionProducts, filters, sort]);

  return (
    <div className="mx-auto max-w-7xl px-8 py-20">
      <div className="mb-16 flex flex-col items-center text-center">
        <div className="mb-8 h-16 w-px bg-[#C5A572]" />
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#777]">{brandConfig.name}</p>
        <h1 className="mb-4 font-heading text-5xl uppercase tracking-[0.15em] text-[#222]">{collection?.name || ""}</h1>
        {collection?.description && <p className="max-w-md text-sm leading-loose font-light tracking-wide text-[#777]">{collection.description}</p>}
      </div>

      {loaded && collectionProducts.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center">
          <div className="mb-6 h-px w-12 bg-[#C5A572]" />
          <h2 className="font-heading text-2xl uppercase tracking-[0.15em] text-[#222] mb-3">Coming Soon</h2>
          <p className="max-w-md text-sm leading-loose text-[#777] mb-8">
            This collection is being curated. Check back shortly for new arrivals.
          </p>
          <Link href="/collections" className="btn-secondary">Browse All Collections</Link>
        </div>
      ) : (
        <>
          {flags.filterAndSort ? (
            <FilterSortBar total={filtered.length} filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />
          ) : (
            <div className="mb-12 border-b border-[#E8E2D5] pb-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#777]">{filtered.length} Items</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p._id} product={p as any} />)}
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-sm uppercase tracking-[0.2em] text-[#777]">No items match your filters</p>
          )}
        </>
      )}
    </div>
  );
}
