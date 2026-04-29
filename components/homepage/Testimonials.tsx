"use client";

import { Quote } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const REVIEWS = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "The quality of the shirting fabric is outstanding. The feel, the drape — everything screams premium craftsmanship. Millazo has earned a loyal customer.",
    rating: 5,
  },
  {
    name: "Ananya Mehta",
    location: "New Delhi",
    text: "An effortless purchase from start to finish. The packaging alone made me feel like I was unwrapping something truly special. The linen is impeccable.",
    rating: 5,
  },
  {
    name: "Rohan Gupta",
    location: "Bangalore",
    text: "Bought kurta fabric for my wedding — the Custom Fit service was a game-changer. The team measured me personally and the result was flawless.",
    rating: 5,
  },
];

export default function Testimonials() {
  const { flags } = useApp();
  if (!flags.testimonials) return null;

  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-14 text-center">
        <p
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Voices From Millazo
        </p>
        <h2
          className="text-4xl uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            fontWeight: 400,
          }}
        >
          Testimonials
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <div
            key={r.name}
            className="border p-10 text-center"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Quote
              className="mx-auto mb-6 h-7 w-7 stroke-[1.2]"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p
              className="mb-8 text-sm font-light leading-loose tracking-wide"
              style={{ color: "var(--color-text)" }}
            >
              &ldquo;{r.text}&rdquo;
            </p>
            <div
              className="mx-auto mb-4 h-px w-10"
              style={{ backgroundColor: "var(--color-border)" }}
            />
            <p
              className="text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
            >
              {r.name}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {r.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
