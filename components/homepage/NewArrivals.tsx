"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import ProductCard from "@/components/listing/ProductCard";
import { Product } from "@/lib/mock-data";
import { fetchProducts } from "@/lib/products-client";

export default function NewArrivals() {
  const { flags } = useApp();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then((all) => {
      const arrivals = all.filter((p) => p.newArrival);
      setItems(arrivals.slice(0, 4));
    });
  }, []);

  if (!flags.newArrivals) return null;
  if (items.length === 0) return null;

  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">Just Launched</p>
          <h2 className="font-heading text-4xl uppercase tracking-[0.15em]">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
