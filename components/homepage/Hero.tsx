"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

export default function Hero() {
  const { flags } = useApp();
  const [data, setData] = useState({
    image: brandConfig.content.hero.image,
    title: brandConfig.content.hero.title,
    subtitle: brandConfig.content.hero.subtitle,
    cta: brandConfig.content.hero.cta,
  });

  useEffect(() => {
    fetch("/api/banners", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : {})
      .then((d: any) => {
        setData((prev) => ({
          image: d.heroImage || prev.image,
          title: d.heroTitle || prev.title,
          subtitle: d.heroSubtitle || prev.subtitle,
          cta: d.heroCta || prev.cta,
        }));
      })
      .catch(() => { });
  }, []);

  if (!flags.heroBanner) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8F6F2]" style={{ height: "88vh" }}>
      <img src={data.image} alt={data.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <img src={brandConfig.logo} alt={brandConfig.name}
          className="w-24 md:w-32 mb-6 drop-shadow-lg"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <p className="mb-4 text-xs md:text-sm uppercase tracking-[0.4em] text-white drop-shadow">{brandConfig.tagline}</p>
        <h1 className="mb-6 max-w-3xl font-heading text-4xl md:text-6xl uppercase tracking-[0.12em] text-white font-normal leading-[1.15]">
          {data.title}
        </h1>
        <p className="mb-10 max-w-xl text-sm md:text-base tracking-wide text-white/85 font-light leading-relaxed">{data.subtitle}</p>
        <Link href="/collections" className="btn-primary">
          {data.cta}
        </Link>
      </div>
    </section>
  );
}
