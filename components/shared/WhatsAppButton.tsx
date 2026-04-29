"use client";

import { brandConfig } from "@/brand.config";
import { useApp } from "@/contexts/AppContext";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const { flags } = useApp();

  if (!flags.whatsappButton) return null;

  const message = encodeURIComponent(
    `Hi! I'm interested in your collection at ${brandConfig.name}.`
  );
  const url = `https://wa.me/${brandConfig.whatsapp}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 stroke-[1.5] text-white" />
    </a>
  );
}
