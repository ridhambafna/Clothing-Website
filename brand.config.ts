export const brandConfig = {
  name: "MILLAZO",
  slug: "millazo",
  type: "clothing" as "jewellery" | "clothing",
  tagline: "A Life in Style",

  theme: {
    primary: "#0F0F0F",
    secondary: "#222222",
    accent: "#C5A572",
    background: "#FFFFFF",
    surface: "#F8F6F2",
    text: "#222222",
    textMuted: "#777777",
    border: "#E8E2D5",
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
    mode: "light" as "light" | "dark",
    preset: "italian-luxury",
  },

  logo: "/images/logo.png",
  favicon: "/images/favicon.ico",
  email: "hello@millazo.com",
  phone: "+91-9876543210",
  whatsapp: "+919876543210",
  address: "Mumbai, India",
  social: { instagram: "https://instagram.com/millazo" },

  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
  },

  features: {
    reviews: true,
    wishlist: true,
    coupons: true,
    whatsappButton: true,
    instagramFeed: true,
    viewer3D: false,
    darkMode: false,
  },

  seo: {
    title: "MILLAZO — Premium Shirting & Kurta Fabrics",
    description: "Italian-inspired premium fabrics. Timeless design, uncompromised quality.",
    keywords: ["fabric", "shirting", "kurta", "premium", "luxury", "cotton", "linen"],
  },

  content: {
    hero: {
      title: "Timeless Design, Uncompromised Quality",
      subtitle: "Italian-inspired premium fabrics for the modern wardrobe.",
      cta: "Explore Fabrics",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop",
    },
    collections: [
      { name: "Shirting Fabrics", slug: "shirting", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop" },
      { name: "Kurta Fabrics", slug: "kurta", image: "https://images.unsplash.com/photo-1589363460779-cd717f3a2f0a?q=80&w=800&auto=format&fit=crop" },
      { name: "Linen Blends", slug: "linen", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop" },
    ],
    announcement: {
      text: "New Festive Edit — Premium Kurta Fabrics now in store.",
      link: "/collections/kurta",
    },
  },
};

export type BrandConfig = typeof brandConfig;
