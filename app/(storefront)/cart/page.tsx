"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-40 text-center">
        <ShoppingBag
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
          Your Shopping Bag is Empty
        </h1>
        <p
          className="mb-10 text-sm font-light tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          Discover our handcrafted collections.
        </p>
        <Link
          href="/collections/rings"
          className="border px-10 py-4 text-sm uppercase tracking-[0.25em] transition-all duration-300 hover:bg-black hover:text-white"
          style={{ borderColor: "var(--color-text)", color: "var(--color-text)" }}
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-16">
      <h1
        className="mb-12 text-4xl uppercase tracking-[0.15em]"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-text)",
          fontWeight: 400,
        }}
      >
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Cart items */}
        <div className="lg:col-span-7 space-y-0">
          {cart.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-6 py-8"
              style={{
                borderTop: idx === 0 ? `1px solid var(--color-border)` : "none",
                borderBottom: `1px solid var(--color-border)`,
              }}
            >
              {/* Thumbnail */}
              <div className="h-32 w-24 flex-shrink-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="mb-1 text-sm uppercase tracking-[0.15em]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--color-text)",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="text-xs uppercase tracking-[0.2em]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Size: {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="transition-opacity duration-200 hover:opacity-60"
                    aria-label="Remove item"
                  >
                    <Trash2
                      className="h-5 w-5 stroke-[1.5]"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity controls */}
                  <div
                    className="flex items-center border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-9 w-9 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4 stroke-[1.5]" style={{ color: "var(--color-text)" }} />
                    </button>
                    <span
                      className="flex h-9 w-10 items-center justify-center text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-9 w-9 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 stroke-[1.5]" style={{ color: "var(--color-text)" }} />
                    </button>
                  </div>
                  {/* Line total */}
                  <p
                    className="text-sm tracking-wide"
                    style={{ color: "var(--color-text)" }}
                  >
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start border p-8"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            className="mb-8 text-sm uppercase tracking-[0.2em]"
            style={{ color: "var(--color-text)" }}
          >
            Order Summary
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-light tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Subtotal
              </span>
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-light tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Shipping
              </span>
              <span
                className="text-sm uppercase tracking-[0.15em]"
                style={{ color: "var(--color-text)" }}
              >
                Complimentary
              </span>
            </div>
            <div
              className="flex items-center justify-between border-t pt-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="text-sm uppercase tracking-[0.2em]"
                style={{ color: "var(--color-text)" }}
              >
                Total
              </span>
              <span className="text-lg" style={{ color: "var(--color-text)" }}>
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full py-4 text-center text-sm uppercase tracking-[0.2em] text-white transition-opacity duration-200 hover:opacity-80"
            style={{ backgroundColor: "var(--color-text)" }}
          >
            Proceed to Checkout
          </Link>

          <p
            className="mt-4 text-center text-xs font-light tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            Tax included. Free returns within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
