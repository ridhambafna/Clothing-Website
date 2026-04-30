"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

interface BarOffer { description: string; link: string; bg: string; color: string; }

export default function AnnouncementBar() {
  const { flags, user, openAuthPopup } = useApp();
  const [offer, setOffer] = useState<BarOffer | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/offers?bar=1", { cache: "no-store" }).then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/banners", { cache: "no-store" }).then((r) => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([offers, banner]: [any[], any]) => {
      const bg = banner.announcementBg || "#0F0F0F";
      const color = banner.announcementColor || "#C5A572";
      if (Array.isArray(offers) && offers.length > 0) {
        const o = offers[0];
        setOffer({
          description: o.description || o.title || "",
          link: o.linkValue || banner.announcementLink || "",
          bg, color,
        });
        return;
      }
      setOffer({
        description: banner.announcementText || "",
        link: banner.announcementLink || "",
        bg, color,
      });
    });
  }, []);

  if (!flags.announcementBar || !flags.offerAnnouncementBar) return null;
  if (!offer || !offer.description) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (flags.signInGateOnAnnouncement && !user) { openAuthPopup(); return; }
    router.push(offer!.link || "/");
  }

  return (
    <div className="py-3 text-center text-sm uppercase tracking-widest" style={{ backgroundColor: offer.bg, color: offer.color }}>
      <a href={offer.link || "/"} onClick={handleClick} className="inline-flex items-center gap-3 hover:opacity-80 transition">
        <span>{offer.description}</span>
        <span className="opacity-70">→</span>
      </a>
    </div>
  );
}
