"use client";

import { Product, MOCK_PRODUCTS } from "@/lib/mock-data";
import ProductCard from "@/components/listing/ProductCard";
import { useApp } from "@/contexts/AppContext";

export default function MoreLikeThis({ product }: { product: Product }) {
  const { flags } = useApp();
  if (!flags.moreLikeThis) return null;

  const related = MOCK_PRODUCTS.filter(
    (p) => p._id !== product._id && (p.category === product.category || p.collection === product.collection)
  ).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="py-20 px-8 max-w-7xl mx-auto border-t border-neutral-200 mt-16">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">You May Also Love</p>
        <h2 className="font-heading text-3xl uppercase tracking-[0.2em]">More Like This</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {related.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
