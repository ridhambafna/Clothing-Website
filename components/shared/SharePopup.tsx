"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function SharePopup({ open, onClose, url, title }: Props) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const text = `Check out this piece from our collection: ${title}`;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm p-10"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-opacity hover:opacity-60"
          aria-label="Close"
        >
          <X className="h-6 w-6 stroke-[1.5]" style={{ color: "var(--color-text-muted)" }} />
        </button>

        <p
          className="mb-2 text-xs uppercase tracking-[0.25em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Share This Piece
        </p>
        <h3
          className="mb-8 text-xl uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}
        >
          {title}
        </h3>

        <div className="space-y-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${fullUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-4 border px-5 py-4 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#25D366" }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>
            </span>
            WhatsApp
          </a>

          <a
            href={`https://www.instagram.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-4 border px-5 py-4 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold"
              style={{
                background:
                  "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
              }}
            >
              IG
            </span>
            Instagram
          </a>

          <button
            onClick={copyLink}
            className="flex w-full items-center gap-4 border px-5 py-4 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--color-text)" }}
            >
              {copied ? (
                <Check className="h-4 w-4 stroke-[2] text-white" />
              ) : (
                <Copy className="h-4 w-4 stroke-[2] text-white" />
              )}
            </span>
            {copied ? "Copied to Clipboard" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
