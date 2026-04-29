"use client";

import Link from "next/link";
import { HeartCrack, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useCart();
  const wishlisted = MOCK_PRODUCTS.filter((p) => wishlist.includes(p._id));

  if (wishlisted.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-40 text-center">
        <HeartCrack
          className="mb-8 h-16 w-16 stroke-[1]"
          style={{ color: "var(--color-border)" }}
        />
        <h1
          className="mb-4 text-3xl uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            fontWeight: 400,
          }}
        >
          Your Wishlist is Empty
        </h1>
        <p
          className="mb-10 text-sm font-light tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          Save pieces you love — come back to them anytime.
        </p>
        <Link
          href="/collections/rings"
          className="border px-10 py-4 text-sm uppercase tracking-[0.25em] transition-all duration-300 hover:bg-black hover:text-white"
          style={{ borderColor: "var(--color-text)", color: "var(--color-text)" }}
        >
          Discover Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-16">
      <div className="mb-12">
        <h1
          className="text-4xl uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            fontWeight: 400,
          }}
        >
          Wishlist
        </h1>
        <p className="mt-2 text-sm font-light" style={{ color: "var(--color-text-muted)" }}>
          {wishlisted.length} saved {wishlisted.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
        {wishlisted.map((product) => (
          <div key={product._id} className="group relative">
            <Link href={`/product/${product.slug}`} className="block">
              <div className="overflow-hidden aspect-[4/5] mb-5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
              </div>
              <h3
                className="mb-1 text-sm uppercase tracking-[0.15em]"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                }}
              >
                {product.name}
              </h3>
              <p className="text-sm font-light" style={{ color: "var(--color-text-muted)" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </Link>

            <button
              onClick={() => toggleWishlist(product._id)}
              className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 hover:opacity-60"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Trash2 className="h-4 w-4 stroke-[1.5]" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
