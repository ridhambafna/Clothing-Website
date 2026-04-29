"use client";

import { Truck, ShieldCheck, RotateCcw, Award } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const BADGES = [
  {
    icon: Truck,
    title: "Complimentary Delivery",
    desc: "Free shipping on every order, worldwide",
  },
  {
    icon: ShieldCheck,
    title: "Lifetime Authenticity",
    desc: "Every piece comes with a Millazo certificate",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    desc: "Easy, no-questions-asked exchange policy",
  },
  {
    icon: Award,
    title: "Hand-Crafted in India",
    desc: "By master artisans from our atelier",
  },
];

export default function TrustBadges() {
  const { flags } = useApp();
  if (!flags.trustBadges) return null;

  return (
    <section
      className="py-20"
      style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="text-center">
                <Icon
                  className="mx-auto mb-5 h-9 w-9 stroke-[1.2]"
                  style={{ color: "var(--color-text)" }}
                />
                <h3
                  className="mb-2 text-xs uppercase tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-text)",
                  }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-xs font-light leading-relaxed"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
