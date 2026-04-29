"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Lightbox from "@/components/shared/Lightbox";
import { useApp } from "@/contexts/AppContext";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const { flags } = useApp();
  const [idx, setIdx] = useState(0);
  const [lbOpen, setLbOpen] = useState(false);

  const safe = images && images.length > 0 ? images : [""];

  const prev = () => setIdx((i) => (i - 1 + safe.length) % safe.length);
  const next = () => setIdx((i) => (i + 1) % safe.length);

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden mb-4 group cursor-zoom-in"
        onClick={() => setLbOpen(true)}
      >
        <img src={safe[idx]} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition">
          <ZoomIn className="w-5 h-5 stroke-[1.5]" />
        </div>
        {flags.arrowNavigation && safe.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 hover:bg-white transition"
              aria-label="Previous image">
              <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 hover:bg-white transition"
              aria-label="Next image">
              <ChevronRight className="w-6 h-6 stroke-[1.5]" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-3">
        {safe.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`aspect-square w-20 overflow-hidden flex-shrink-0 ${idx === i ? "ring-1 ring-black ring-offset-2" : ""}`}>
            <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <Lightbox open={lbOpen} images={safe} index={idx} onClose={() => setLbOpen(false)} onIndexChange={setIdx} />
    </div>
  );
}
