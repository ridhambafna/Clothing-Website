"use client";

import Link from "next/link";
import { brandConfig } from "@/brand.config";

export default function Storytelling() {
  return (
    <section
      className="py-28"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-3xl px-8 text-center">
        <div
          className="mx-auto mb-10 h-16 w-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
        <p
          className="mb-4 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Est. 2020
        </p>
        <h2
          className="mb-8 text-4xl uppercase tracking-[0.15em] md:text-5xl"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            fontWeight: 400,
          }}
        >
          {brandConfig.name}
        </h2>
        <p
          className="mx-auto mb-12 max-w-lg text-base leading-loose font-light tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          Every fabric we offer is a conversation between tradition and modernity.
          Italian-inspired weaves, hand-finished with obsessive precision —
          each metre arrives ready for the wardrobe of a lifetime.
        </p>
        <Link
          href="/p/about-us"
          className="group relative inline-block text-sm uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text)" }}
        >
          About Millazo
          <span
            className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
            style={{ backgroundColor: "var(--color-text)" }}
          />
        </Link>
        <div
          className="mx-auto mt-10 h-16 w-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>
    </section>
  );
}
