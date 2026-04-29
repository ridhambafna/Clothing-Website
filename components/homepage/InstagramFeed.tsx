"use client";

import { Camera } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

const IMAGES = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617033935324-a8c17e46ac0a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop",
];

export default function InstagramFeed() {
  const { flags } = useApp();
  if (!flags.lookbook) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-14 text-center">
          <p
            className="mb-3 text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            <a
              href={brandConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
            >
              <Camera className="h-4 w-4 stroke-[1.5]" /> @{brandConfig.slug}
            </a>
          </p>
          <h2
            className="text-4xl uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text)",
              fontWeight: 400,
            }}
          >
            The Lookbook
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {IMAGES.map((src, i) => (
            <a
              key={i}
              href={brandConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden aspect-square"
            >
              <img
                src={src}
                alt={`Lookbook ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <Camera className="h-7 w-7 stroke-[1.5] text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
