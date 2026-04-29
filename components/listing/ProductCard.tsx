"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/mock-data";
import { useApp } from "@/contexts/AppContext";

interface Props {
  product: Product & { tags?: string[] };
  showBadges?: boolean;
}

const TAG_STYLES: Record<string, string> = {
  NEW: "bg-[#0F0F0F] text-[#C5A572]",
  BESTSELLER: "bg-[#C5A572] text-white",
  SALE: "bg-[#8B1A1A] text-white",
};

export default function ProductCard({ product, showBadges = true }: Props) {
  const { flags } = useApp();
  const [hovered, setHovered] = useState(false);

  const secondaryImage = product.gallery?.[1];
  const showSecondary = hovered && secondaryImage;

  // Resolve tags: prefer explicit tags array, fall back to legacy boolean fields
  const tags: string[] = Array.isArray((product as any).tags) && (product as any).tags.length
    ? (product as any).tags
    : ([
        product.newArrival ? "NEW" : null,
        product.bestseller ? "BESTSELLER" : null,
        product.onSale ? "SALE" : null,
      ].filter(Boolean) as string[]);

  return (
    <Link href={`/product/${product.slug}`} className="group block"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative overflow-hidden aspect-[4/5] mb-5 bg-[#F8F6F2] transition group-hover:shadow-lg group-hover:border-b-2 group-hover:border-b-[#C5A572]">
        <img src={product.image} alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: showSecondary ? 0 : 1 }} />
        {secondaryImage && (
          <img src={secondaryImage} alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 scale-105"
            style={{ opacity: showSecondary ? 1 : 0 }} />
        )}

        {showBadges && tags.length > 0 && flags.saleBadge && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full ${TAG_STYLES[tag] || "bg-[#0F0F0F] text-white"}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {flags.outOfStockBadge && !product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="px-4 py-2 text-xs uppercase tracking-[0.25em] bg-[#0F0F0F] text-white">Out of Stock</span>
          </div>
        )}
      </div>

      <h3 className="mb-1 font-heading text-sm uppercase tracking-[0.15em] text-[#222]">{product.name}</h3>
      <div className="flex items-center gap-2">
        <p className="text-sm text-[#222]">₹{product.price.toLocaleString("en-IN")}</p>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-xs text-[#777] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</p>
        )}
      </div>
    </Link>
  );
}
