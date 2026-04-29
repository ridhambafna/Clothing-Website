import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { brandConfig } from "@/brand.config";
import { CartProvider } from "@/contexts/CartContext";
import { AppProvider } from "@/contexts/AppContext";
import AuthPopup from "@/components/shared/AuthPopup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: brandConfig.seo.title,
  description: brandConfig.seo.description,
  keywords: brandConfig.seo.keywords,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = brandConfig;
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${outfit.variable}`}
      style={
        {
          "--color-primary": theme.primary,
          "--color-secondary": theme.secondary,
          "--color-accent": theme.accent,
          "--color-bg": theme.background,
          "--color-surface": theme.surface,
          "--color-text": theme.text,
          "--color-text-muted": theme.textMuted,
          "--color-border": theme.border,
          "--font-heading": theme.fontHeading,
          "--font-body": theme.fontBody,
        } as React.CSSProperties
      }
    >
      <body>
        <AppProvider>
          <CartProvider>
            {children}
            <AuthPopup />
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
