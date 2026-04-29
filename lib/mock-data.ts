export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  slug: string;
  image: string;
  gallery: string[];
  description: string;
  category: string;
  collection?: string;
  metal: string;
  stone: string;
  weight: string;
  purity: string;
  sku: string;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  onSale: boolean;
  supplier: string;
  rating?: number;
  reviewCount?: number;
}

// MILLAZO uses ONLY admin-managed products. Storefront fetches from /api/products.
// This array is intentionally empty so no demo/placeholder products show on the site.
export const MOCK_PRODUCTS: Product[] = [];

export const ALL_METALS: string[] = [];
export const ALL_STONES: string[] = [];
export const ALL_COLLECTIONS: string[] = [];
