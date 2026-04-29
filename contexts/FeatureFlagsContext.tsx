"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface FeatureFlags {
  // Homepage sections
  announcementBar: boolean;
  heroBanner: boolean;
  featuredCollections: boolean;
  featuredProducts: boolean;
  trustBadges: boolean;
  newArrivals: boolean;
  testimonials: boolean;
  instagramFeed: boolean;

  // Popups & Auth
  autoAuthPopup: boolean;
  signInGateOnAnnouncementBar: boolean;

  // Product page
  sizePopupBeforeAddToBag: boolean;
  sizePopupBeforeWishlist: boolean;
  buyNowButton: boolean;
  shareButton: boolean;
  pincodeDeliveryCheck: boolean;
  imageZoomOnHover: boolean;
  arrowNavigation: boolean;
  moreLikeThis: boolean;
  descriptionAccordion: boolean;
  specificationAccordion: boolean;
  supplierAccordion: boolean;
  returnsAccordion: boolean;

  // Offers & Promotions
  promoCodeAtCheckout: boolean;
  saleBadgeOnProducts: boolean;
  offerAnnouncementBar: boolean;

  // Store features
  wishlistSitewide: boolean;
  customerReviews: boolean;
  whatsappButton: boolean;
  filterAndSortOnListing: boolean;
  outOfStockBadge: boolean;
  socialShareOnProduct: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  announcementBar: true,
  heroBanner: true,
  featuredCollections: true,
  featuredProducts: true,
  trustBadges: true,
  newArrivals: true,
  testimonials: true,
  instagramFeed: false,
  autoAuthPopup: true,
  signInGateOnAnnouncementBar: true,
  sizePopupBeforeAddToBag: true,
  sizePopupBeforeWishlist: true,
  buyNowButton: true,
  shareButton: true,
  pincodeDeliveryCheck: true,
  imageZoomOnHover: true,
  arrowNavigation: true,
  moreLikeThis: true,
  descriptionAccordion: true,
  specificationAccordion: true,
  supplierAccordion: true,
  returnsAccordion: true,
  promoCodeAtCheckout: true,
  saleBadgeOnProducts: true,
  offerAnnouncementBar: true,
  wishlistSitewide: true,
  customerReviews: true,
  whatsappButton: true,
  filterAndSortOnListing: true,
  outOfStockBadge: true,
  socialShareOnProduct: true,
};

export const FLAG_GROUPS: Array<{
  title: string;
  keys: Array<{ key: keyof FeatureFlags; label: string }>;
}> = [
  {
    title: "Homepage",
    keys: [
      { key: "announcementBar", label: "Announcement Bar" },
      { key: "heroBanner", label: "Hero Banner" },
      { key: "featuredCollections", label: "Featured Collections" },
      { key: "featuredProducts", label: "Featured Products" },
      { key: "trustBadges", label: "Trust Badges" },
      { key: "newArrivals", label: "New Arrivals" },
      { key: "testimonials", label: "Testimonials" },
      { key: "instagramFeed", label: "Instagram / Lookbook" },
    ],
  },
  {
    title: "Popups & Auth",
    keys: [
      { key: "autoAuthPopup", label: "Auto Login Popup (10s)" },
      { key: "signInGateOnAnnouncementBar", label: "Sign-in Gate on Announcement Bar Click" },
    ],
  },
  {
    title: "Product Page",
    keys: [
      { key: "sizePopupBeforeAddToBag", label: "Size Popup Before Add to Bag" },
      { key: "sizePopupBeforeWishlist", label: "Size Popup Before Wishlist" },
      { key: "buyNowButton", label: "Buy Now Button" },
      { key: "shareButton", label: "Share Button" },
      { key: "pincodeDeliveryCheck", label: "Pincode Delivery Check" },
      { key: "imageZoomOnHover", label: "Image Zoom on Hover" },
      { key: "arrowNavigation", label: "Arrow Image Navigation" },
      { key: "moreLikeThis", label: "More Like This Section" },
      { key: "descriptionAccordion", label: "Description Accordion" },
      { key: "specificationAccordion", label: "Specification Accordion" },
      { key: "supplierAccordion", label: "Supplier Information Accordion" },
      { key: "returnsAccordion", label: "Returns & Exchange Accordion" },
    ],
  },
  {
    title: "Offers & Promotions",
    keys: [
      { key: "promoCodeAtCheckout", label: "Promo Code at Checkout" },
      { key: "saleBadgeOnProducts", label: "Sale Badge on Products" },
      { key: "offerAnnouncementBar", label: "Offer Announcement Bar" },
    ],
  },
  {
    title: "Store Features",
    keys: [
      { key: "wishlistSitewide", label: "Wishlist Sitewide" },
      { key: "customerReviews", label: "Customer Reviews on Product Page" },
      { key: "whatsappButton", label: "WhatsApp Enquiry Button" },
      { key: "filterAndSortOnListing", label: "Filter & Sort on Listing Page" },
      { key: "outOfStockBadge", label: "Out of Stock Badge" },
      { key: "socialShareOnProduct", label: "Social Share on Product Page" },
    ],
  },
];

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggle: (key: keyof FeatureFlags) => void;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  resetAll: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

const STORAGE_KEY = "lux-feature-flags";

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FeatureFlags>;
        setFlags({ ...DEFAULT_FLAGS, ...parsed });
      }
    } catch {
      // ignore
    }

    // Listen for changes from other tabs / admin updates
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setFlags({ ...DEFAULT_FLAGS, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  }, [flags, isMounted]);

  const toggle = useCallback((key: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setFlag = useCallback((key: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setFlags(DEFAULT_FLAGS);
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, toggle, setFlag, resetAll }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error("useFeatureFlags must be used inside FeatureFlagsProvider");
  return ctx;
}
