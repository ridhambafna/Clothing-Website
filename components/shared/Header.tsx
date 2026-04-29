"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Heart, ShoppingBag, X, ChevronDown } from "lucide-react";
import { brandConfig } from "@/brand.config";
import { useCart } from "@/contexts/CartContext";
import { useApp } from "@/contexts/AppContext";
import { fetchProducts } from "@/lib/products-client";
import { Product } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

interface NavLink { label: string; href: string; children?: { label: string; href: string }[]; }

const FALLBACK_NAV: NavLink[] = [
  { label: "Collections", href: "/collections" },
  { label: "Shirting", href: "/collections/shirting" },
  { label: "Kurta", href: "/collections/kurta" },
  { label: "Linen", href: "/collections/linen" },
  { label: "Contact", href: "/p/contact-us" },
];

export default function Header() {
  const { cartCount, wishlist } = useCart();
  const { user, openAuthPopup, flags } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [navLinks, setNavLinks] = useState<NavLink[]>(FALLBACK_NAV);
  const [products, setProducts] = useState<Product[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/navbar", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: NavLink[]) => { if (Array.isArray(data) && data.length > 0) setNavLinks(data); })
      .catch(() => {});
  }, []);

  useEffect(() => { if (searchOpen && inputRef.current) inputRef.current.focus(); }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    fetchProducts().then(setProducts);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [searchOpen]);

  const filtered = q.trim() ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];

  function closeSearch() { setSearchOpen(false); setQ(""); }
  function go(slug: string) { closeSearch(); router.push(`/product/${slug}`); }

  function onAccount(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) { openAuthPopup(); return; }
    router.push(user.role === "admin" ? "/admin" : "/account");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E8E2D5] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src={brandConfig.logo} alt={brandConfig.name}
              className="h-10 w-auto" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <span className="font-heading text-xl tracking-[0.25em] text-[#0F0F0F] hidden sm:inline">
              {brandConfig.name}
            </span>
          </Link>

          {/* CENTER: Nav */}
          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((l) => (
              <div key={l.label} className="relative"
                onMouseEnter={() => l.children?.length && setOpenDropdown(l.label)}
                onMouseLeave={() => setOpenDropdown(null)}>
                <Link href={l.href} className="group relative inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-[#222222] hover:text-[#C5A572] transition">
                  {l.label}
                  {l.children?.length ? <ChevronDown className="w-3 h-3" /> : null}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[#C5A572] transition-all duration-300 group-hover:w-full" />
                </Link>
                {l.children?.length && openDropdown === l.label && (
                  <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-white border border-[#E8E2D5] shadow-lg py-2">
                    {l.children.map((c) => (
                      <Link key={c.label} href={c.href} className="block px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#F8F6F2] hover:text-[#C5A572] transition">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT: Icons */}
          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="text-[#222] hover:text-[#C5A572] transition">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button onClick={onAccount} aria-label="Account" className="text-[#222] hover:text-[#C5A572] transition">
              <User className="w-5 h-5 stroke-[1.5]" />
            </button>
            {flags.wishlist && (
              <Link href="/wishlist" aria-label="Wishlist" className="relative text-[#222] hover:text-[#C5A572] transition">
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A572] text-[9px] font-medium text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}
            <Link href="/cart" aria-label="Cart" className="relative text-[#222] hover:text-[#C5A572] transition">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A572] text-[9px] font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* INLINE SEARCH OVERLAY — page visible underneath */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]" onClick={closeSearch}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative max-w-3xl mx-auto mt-24 px-6" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border border-[#E8E2D5] shadow-2xl">
              <div className="flex items-center px-6 py-4 border-b border-[#E8E2D5]">
                <Search className="w-5 h-5 stroke-[1.5] text-[#C5A572] mr-3" />
                <input ref={inputRef} type="text" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search fabrics..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-[#777]" />
                <button onClick={closeSearch} aria-label="Close search" className="ml-3 text-[#777] hover:text-[#0F0F0F]">
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {flags.searchSuggestions && q.trim() && (
                <div className="max-h-[55vh] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-[#777] text-center">No results for &quot;{q}&quot;</p>
                  ) : (
                    filtered.map((p) => (
                      <button key={p._id} onClick={() => go(p.slug)}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-[#F8F6F2] transition text-left border-b border-[#F0EBDF] last:border-b-0">
                        <div className="w-12 h-14 flex-shrink-0 overflow-hidden bg-[#F8F6F2]">
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-heading text-sm">{p.name}</p>
                          <p className="text-xs text-[#777] capitalize mt-0.5">{p.category}</p>
                        </div>
                        <p className="text-sm">{formatINR(p.price)}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!q.trim() && (
                <p className="px-6 py-8 text-xs uppercase tracking-[0.25em] text-[#777] text-center">
                  Press Esc or click outside to close
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
