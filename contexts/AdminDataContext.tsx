"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface Offer {
  id: string;
  title: string;
  description: string;
  link: string;
  visibleOnAnnouncementBar: boolean;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrderValue: number;
  expiresAt: string; // ISO
  active: boolean;
}

export interface Pincode {
  id: string;
  code: string;
  area: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  blocked: boolean;
}

interface AdminDataContextType {
  offers: Offer[];
  coupons: Coupon[];
  pincodes: Pincode[];
  customers: Customer[];

  // Offers
  addOffer: (o: Omit<Offer, "id">) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  removeOffer: (id: string) => void;

  // Coupons
  addCoupon: (c: Omit<Coupon, "id">) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  removeCoupon: (id: string) => void;
  validateCoupon: (code: string, orderValue: number) => { ok: boolean; coupon?: Coupon; discount?: number; error?: string };

  // Pincodes
  addPincode: (p: Omit<Pincode, "id">) => void;
  removePincode: (id: string) => void;
  isPincodeServiceable: (code: string) => Pincode | null;

  // Customers
  toggleCustomerBlocked: (id: string) => void;
  removeCustomer: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

const KEY_OFFERS = "lux-admin-offers";
const KEY_COUPONS = "lux-admin-coupons";
const KEY_PINCODES = "lux-admin-pincodes";
const KEY_CUSTOMERS = "lux-admin-customers";

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "offer-1",
    title: "Festive Edit",
    description: "Enjoy 15% off on your first order — sign in to redeem",
    link: "/collections/rings",
    visibleOnAnnouncementBar: true,
    active: true,
  },
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "WELCOME15",
    type: "percent",
    value: 15,
    minOrderValue: 5000,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: "coup-2",
    code: "FLAT500",
    type: "flat",
    value: 500,
    minOrderValue: 3000,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
];

const DEFAULT_PINCODES: Pincode[] = [
  { id: "pin-1", code: "400001", area: "Mumbai - Fort" },
  { id: "pin-2", code: "400050", area: "Mumbai - Bandra West" },
  { id: "pin-3", code: "110001", area: "New Delhi - Connaught Place" },
  { id: "pin-4", code: "560001", area: "Bangalore - MG Road" },
  { id: "pin-5", code: "600001", area: "Chennai - Parrys" },
  { id: "pin-6", code: "700001", area: "Kolkata - BBD Bagh" },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    ordersCount: 3,
    totalSpent: 145000,
    blocked: false,
  },
  {
    id: "cust-2",
    name: "Ananya Mehta",
    email: "ananya@example.com",
    phone: "+91 98765 43211",
    ordersCount: 1,
    totalSpent: 120000,
    blocked: false,
  },
  {
    id: "cust-3",
    name: "Rohan Gupta",
    email: "rohan@example.com",
    phone: "+91 98765 43212",
    ordersCount: 2,
    totalSpent: 65000,
    blocked: false,
  },
];

function loadOrDefault<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [pincodes, setPincodes] = useState<Pincode[]>(DEFAULT_PINCODES);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setOffers(loadOrDefault(KEY_OFFERS, DEFAULT_OFFERS));
    setCoupons(loadOrDefault(KEY_COUPONS, DEFAULT_COUPONS));
    setPincodes(loadOrDefault(KEY_PINCODES, DEFAULT_PINCODES));
    setCustomers(loadOrDefault(KEY_CUSTOMERS, DEFAULT_CUSTOMERS));
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem(KEY_OFFERS, JSON.stringify(offers)); }, [offers, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem(KEY_COUPONS, JSON.stringify(coupons)); }, [coupons, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem(KEY_PINCODES, JSON.stringify(pincodes)); }, [pincodes, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem(KEY_CUSTOMERS, JSON.stringify(customers)); }, [customers, isMounted]);

  // Offers
  const addOffer = useCallback((o: Omit<Offer, "id">) => {
    setOffers((prev) => [...prev, { ...o, id: `offer-${Date.now()}` }]);
  }, []);
  const updateOffer = useCallback((id: string, patch: Partial<Offer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);
  const removeOffer = useCallback((id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }, []);

  // Coupons
  const addCoupon = useCallback((c: Omit<Coupon, "id">) => {
    setCoupons((prev) => [...prev, { ...c, id: `coup-${Date.now()}` }]);
  }, []);
  const updateCoupon = useCallback((id: string, patch: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);
  const removeCoupon = useCallback((id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);
  const validateCoupon = useCallback(
    (code: string, orderValue: number) => {
      const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) return { ok: false, error: "Invalid promo code" };
      if (!found.active) return { ok: false, error: "This code is no longer active" };
      if (new Date(found.expiresAt).getTime() < Date.now())
        return { ok: false, error: "This code has expired" };
      if (orderValue < found.minOrderValue)
        return {
          ok: false,
          error: `Minimum order ₹${found.minOrderValue.toLocaleString("en-IN")} required`,
        };
      const discount =
        found.type === "flat" ? found.value : Math.floor((orderValue * found.value) / 100);
      return { ok: true, coupon: found, discount };
    },
    [coupons]
  );

  // Pincodes
  const addPincode = useCallback((p: Omit<Pincode, "id">) => {
    setPincodes((prev) => [...prev, { ...p, id: `pin-${Date.now()}` }]);
  }, []);
  const removePincode = useCallback((id: string) => {
    setPincodes((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const isPincodeServiceable = useCallback(
    (code: string) => pincodes.find((p) => p.code === code.trim()) ?? null,
    [pincodes]
  );

  // Customers
  const toggleCustomerBlocked = useCallback((id: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  }, []);
  const removeCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        offers,
        coupons,
        pincodes,
        customers,
        addOffer,
        updateOffer,
        removeOffer,
        addCoupon,
        updateCoupon,
        removeCoupon,
        validateCoupon,
        addPincode,
        removePincode,
        isPincodeServiceable,
        toggleCustomerBlocked,
        removeCustomer,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}
