"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

export default function Hero() {
  const { flags } = useApp();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/banners", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: any) => {
        const customSlide: Slide = {
          image: d.heroImage || brandConfig.content.hero.image,
          title: d.heroTitle || brandConfig.content.hero.title,
          subtitle: d.heroSubtitle || brandConfig.content.hero.subtitle,
          cta: d.heroCta || brandConfig.content.hero.cta,
          link: "/collections",
        };

        const defaultSlides: Slide[] = [
          customSlide,
          {
            image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop",
            title: "The Pure Linen Edit",
            subtitle: "Designed with lightweight, breathable linen fabrics for effortless elegance.",
            cta: "Discover Linen",
            link: "/collections/linen",
          },
          {
            image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=2000&auto=format&fit=crop",
            title: "Heritage Shirting Weaves",
            subtitle: "Experience the ultimate in bespoke comfort and structural sophistication.",
            cta: "Shop Shirting",
            link: "/collections/shirts",
          },
        ];

        setSlides(defaultSlides);
      })
      .catch(() => {
        setSlides([
          {
            image: brandConfig.content.hero.image,
            title: brandConfig.content.hero.title,
            subtitle: brandConfig.content.hero.subtitle,
            cta: brandConfig.content.hero.cta,
            link: "/collections",
          },
          {
            image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop",
            title: "The Pure Linen Edit",
            subtitle: "Designed with lightweight, breathable linen fabrics for effortless elegance.",
            cta: "Discover Linen",
            link: "/collections/linen",
          },
          {
            image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=2000&auto=format&fit=crop",
            title: "Heritage Shirting Weaves",
            subtitle: "Experience the ultimate in bespoke comfort and structural sophistication.",
            cta: "Shop Shirting",
            link: "/collections/shirts",
          },
        ]);
      });
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides, isHovered]);

  const prevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe handlers
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
    const threshold = 50; // swipe threshold in pixels
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
  };

  if (!flags.heroBanner) return null;
  if (slides.length === 0) return <section className="bg-[#F8F6F2]" style={{ height: "80vh" }} />;

  return (
    <section 
      className="group relative overflow-hidden bg-[#F8F6F2] select-none" 
      style={{ height: "80vh" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      {slides.map((slide, idx) => {
        const isActive = idx === activeIdx;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {/* Background Image */}
            <img 
              src={slide.image} 
              alt={slide.title} 
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out ${isActive ? "scale-105" : "scale-100"}`} 
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <img src={brandConfig.logo} alt={brandConfig.name}
                className="w-20 md:w-28 mb-5 drop-shadow-lg opacity-90"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <p className="mb-3 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white drop-shadow font-light">{brandConfig.tagline}</p>
              <h1 className="mb-5 max-w-3xl font-heading text-3xl sm:text-5xl md:text-6xl uppercase tracking-[0.1em] text-white font-normal leading-[1.15] drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="mb-8 max-w-lg text-xs sm:text-sm tracking-wide text-white/85 font-light leading-relaxed drop-shadow-sm">{slide.subtitle}</p>
              <Link href={slide.link} className="btn-primary transform hover:scale-105 transition-all duration-300">
                {slide.cta}
              </Link>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/90 text-white hover:text-black transition-all rounded-full border border-white/20 hover:border-white opacity-0 md:group-hover:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-[2px]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/90 text-white hover:text-black transition-all rounded-full border border-white/20 hover:border-white opacity-0 md:group-hover:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-[2px]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeIdx ? "w-6 bg-[#C5A572]" : "w-1.5 bg-white/50 hover:bg-white"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
