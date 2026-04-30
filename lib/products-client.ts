"use client";

import { MOCK_PRODUCTS, Product } from "@/lib/mock-data";

// Convert a Mongo product doc to the Product shape the storefront uses.
export function normalizeDbProduct(d: any): Product {
  return {
    _id: String(d._id),
    name: d.name || "",
    price: Number(d.salePrice || d.price) || 0,
    originalPrice: d.salePrice ? Number(d.price) : (d.originalPrice ?? undefined),
    slug: d.slug || (d.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    image: d.image || "",
    gallery: Array.isArray(d.gallery) ? d.gallery : (typeof d.gallery === "string" && d.gallery ? d.gallery.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
    description: d.description || "",
    category: d.category || "",
    collection: d.collectionSlug || d.collection || undefined,
    metal: d.metalType || d.metal || "",
    stone: d.stoneType || d.stone || "",
    weight: d.weight ? String(d.weight) : "",
    purity: d.purity || "",
    sku: d.sku || "",
    inStock: d.inStock !== false,
    featured: !!d.featured,
    bestseller: !!d.bestseller,
    newArrival: !!d.newArrival,
    onSale: !!d.onSale,
    supplier: d.supplier || "",
    rating: d.rating,
    reviewCount: d.reviewCount,
    // pass-through for new fields
    ...(d.tags ? { tags: d.tags } : {}),
    ...(d.sizes ? { sizes: d.sizes } : {}),
    ...(d.fabricType ? { fabricType: d.fabricType } : {}),
    ...(d.careInstructions ? { careInstructions: d.careInstructions } : {}),
    ...(typeof d.stock === "number" ? { stock: d.stock } : {}),
  } as any;
}

let cache: { products: Product[]; ts: number } | null = null;

export async function fetchProducts(force = false): Promise<Product[]> {
  if (!force && cache && Date.now() - cache.ts < 30_000) return cache.products;
  try {
    const r = await fetch("/api/products", { cache: "no-store" });
    if (!r.ok) return MOCK_PRODUCTS;
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) return MOCK_PRODUCTS;
    const normalized = data.map(normalizeDbProduct);
    // Merge: DB products + mock products NOT already in DB by slug
    const slugs = new Set(normalized.map((p) => p.slug));
    const merged = [...normalized, ...MOCK_PRODUCTS.filter((p) => !slugs.has(p.slug))];
    cache = { products: merged, ts: Date.now() };
    return merged;
  } catch {
    return MOCK_PRODUCTS;
  }
}
