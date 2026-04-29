"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import ProductCard from "@/components/listing/ProductCard";
import { Product } from "@/lib/mock-data";
import { fetchProducts } from "@/lib/products-client";

export default function FeaturedProducts() {
  const { flags } = useApp();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then((all) => {
      const featured = all.filter((p) => p.featured);
      setItems((featured.length > 0 ? featured : all).slice(0, 4));
    });
  }, []);

  if (!flags.featuredProducts) return null;
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">Selected for You</p>
        <h2 className="font-heading text-4xl uppercase tracking-[0.15em]">Featured Products</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {items.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
