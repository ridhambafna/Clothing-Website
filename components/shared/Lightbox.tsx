"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export default function Lightbox({ open, images, index, onClose, onIndexChange }: Props) {
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, index, images.length, onClose, onIndexChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-white transition-opacity hover:opacity-60"
        aria-label="Close"
      >
        <X className="h-8 w-8 stroke-[1.5]" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index - 1 + images.length) % images.length);
        }}
        className="absolute left-6 text-white transition-opacity hover:opacity-60"
        aria-label="Previous"
      >
        <ChevronLeft className="h-10 w-10 stroke-[1.5]" />
      </button>

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index + 1) % images.length);
        }}
        className="absolute right-6 text-white transition-opacity hover:opacity-60"
        aria-label="Next"
      >
        <ChevronRight className="h-10 w-10 stroke-[1.5]" />
      </button>

      <div className="absolute bottom-8 text-xs uppercase tracking-[0.25em] text-white/70">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
