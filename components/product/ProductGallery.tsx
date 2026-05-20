"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Lightbox from "@/components/shared/Lightbox";
import { useApp } from "@/contexts/AppContext";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const { flags } = useApp();
  const [idx, setIdx] = useState(0);
  const [lbOpen, setLbOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter out empty / falsy strings so we never pass "" to an <img> src
  const valid = (images || []).filter((s) => typeof s === "string" && s.trim() !== "");
  const hasImages = valid.length > 0;

  const prev = () => setIdx((i) => (i - 1 + valid.length) % valid.length);
  const next = () => setIdx((i) => (i + 1) % valid.length);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (diff > threshold) {
      next();
    } else if (diff < -threshold) {
      prev();
    }
  };

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden mb-4 group cursor-zoom-in select-none"
        onClick={() => hasImages && setLbOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasImages ? (
          <img src={valid[idx]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <span className="text-neutral-400 text-sm uppercase tracking-[0.2em]">No Image</span>
          </div>
        )}
        {hasImages && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition hidden md:block">
            <ZoomIn className="w-5 h-5 stroke-[1.5]" />
          </div>
        )}
        {flags.arrowNavigation && valid.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 hover:bg-white transition hidden md:block"
              aria-label="Previous image">
              <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 hover:bg-white transition hidden md:block"
              aria-label="Next image">
              <ChevronRight className="w-6 h-6 stroke-[1.5]" />
            </button>
          </>
        )}
        
        {/* Mobile gallery dot indicators */}
        {valid.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-10">
            {valid.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === i ? "w-5 bg-black" : "w-1.5 bg-black/20"}`}
              />
            ))}
          </div>
        )}
      </div>
      {hasImages && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {valid.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`aspect-square w-20 overflow-hidden flex-shrink-0 ${idx === i ? "ring-1 ring-black ring-offset-2" : ""}`}>
              <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {hasImages && (
        <Lightbox open={lbOpen} images={valid} index={idx} onClose={() => setLbOpen(false)} onIndexChange={setIdx} />
      )}
    </div>
  );
}
