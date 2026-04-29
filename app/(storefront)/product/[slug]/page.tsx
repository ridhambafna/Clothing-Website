"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Truck, RotateCcw, Share2, ShoppingBag, Zap } from "lucide-react";
import { MOCK_PRODUCTS, Product } from "@/lib/mock-data";
import { fetchProducts } from "@/lib/products-client";
import { brandConfig } from "@/brand.config";
import { useCart } from "@/contexts/CartContext";
import { useApp } from "@/contexts/AppContext";
import ProductGallery from "@/components/product/ProductGallery";
import PincodeCheck from "@/components/product/PincodeCheck";
import ProductAccordions from "@/components/product/ProductAccordions";
import MoreLikeThis from "@/components/product/MoreLikeThis";
import SizePopup from "@/components/shared/SizePopup";
import SharePopup from "@/components/shared/SharePopup";
import { formatINR } from "@/lib/utils";

interface Props { params: Promise<{ slug: string }>; }

const JEWELLERY_MATERIALS = ["Silver", "Gold Plated", "Rose Gold"];

type SizeAction = "bag" | "wishlist" | "buynow";

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product>(() => MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0]);
  useEffect(() => {
    fetchProducts().then((all) => {
      const found = all.find((p) => p.slug === slug);
      if (found) setProduct(found);
    });
  }, [slug]);
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { flags } = useApp();

  const [material, setMaterial] = useState(JEWELLERY_MATERIALS[0]);
  const [sizePopup, setSizePopup] = useState<SizeAction | null>(null);
  const [sharePopup, setSharePopup] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isWishlisted = wishlist.includes(product._id);
  const isJewellery = brandConfig.type === "jewellery";

  function performAction(size: string, action: SizeAction) {
    if (action === "bag") {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity: 1,
      });
      setFeedback("Added to Bag ✓");
      setTimeout(() => setFeedback(""), 2000);
    } else if (action === "buynow") {
      // Buy Now: bypass cart entirely. Stash a single-product payload for checkout.
      try {
        sessionStorage.setItem("lux-buynow", JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          quantity: 1,
        }));
      } catch {}
      router.push("/checkout?mode=buynow");
    } else if (action === "wishlist") {
      toggleWishlist(product._id);
      setFeedback(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist ♥");
      setTimeout(() => setFeedback(""), 2000);
    }
  }

  function trigger(action: SizeAction) {
    const flagKey = action === "wishlist" ? "sizePopupBeforeWishlist" : "sizePopupBeforeBag";
    if (flags[flagKey]) {
      setSizePopup(action);
    } else {
      // perform with default size
      performAction("M", action);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-16">
      <nav className="mb-12 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
        <Link href="/" className="hover:text-black transition">Home</Link>
        <span>/</span>
        <Link href={`/collections/${product.category}`} className="hover:text-black transition capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.gallery} name={product.name} />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neutral-500">{brandConfig.name}</p>
          <h1 className="mb-4 font-heading text-3xl uppercase tracking-[0.1em]">{product.name}</h1>
          <div className="mb-2 text-2xl tracking-wide flex items-baseline gap-3">
            {product.onSale && product.originalPrice && (
              <span className="text-neutral-400 line-through text-lg">{formatINR(product.originalPrice)}</span>
            )}
            <span className={product.onSale ? "text-[#8C001A]" : ""}>{formatINR(product.price)}</span>
          </div>
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-neutral-500">Tax included. Free shipping.</p>
          <p className="mb-10 text-sm leading-loose font-light text-neutral-600">{product.description}</p>

          {isJewellery && (
            <div className="mb-8">
              <p className="mb-4 text-xs uppercase tracking-[0.2em]">Material: <span className="font-normal">{material}</span></p>
              <div className="flex gap-3">
                {JEWELLERY_MATERIALS.map((m) => (
                  <button key={m} onClick={() => setMaterial(m)}
                    className={`h-9 px-4 text-xs uppercase tracking-[0.15em] border transition ${material === m ? "bg-black text-white border-black" : "border-neutral-300 text-black"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available sizes (display only — picker is in the popup) */}
          <div className="mb-6">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#777]">Available Sizes</p>
            <div className="flex flex-wrap gap-2">
              {((Array.isArray((product as any).sizes) && (product as any).sizes.length > 0)
                ? (product as any).sizes
                : (brandConfig.type === "jewellery" ? ["6","7","8","9","10"] : ["XS","S","M","L","XL","XXL"])
              ).map((s: string) => (
                <span key={s} className="px-3 h-9 inline-flex items-center justify-center text-xs uppercase tracking-[0.15em] border border-[#E8E2D5] text-[#222]">
                  {s}
                </span>
              ))}
              <span className="px-3 h-9 inline-flex items-center justify-center text-xs uppercase tracking-[0.15em] border border-[#C5A572] text-[#C5A572]">
                Custom Fit
              </span>
            </div>
            <p className="text-xs text-[#777] mt-2 font-light">Pick your size on Add to Bag — or choose Custom Fit and our team will measure you.</p>
          </div>

          {feedback && (
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-green-700">{feedback}</p>
          )}

          <button onClick={() => trigger("bag")}
            className="mb-3 w-full bg-black text-white py-4 text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" /> Add to Shopping Bag
          </button>

          {flags.buyNowButton && (
            <button onClick={() => trigger("buynow")}
              className="mb-3 w-full border-2 border-black bg-white text-black py-4 text-sm uppercase tracking-[0.2em] hover:bg-black hover:text-white transition flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 stroke-[1.5]" /> Buy Now
            </button>
          )}

          {flags.wishlist && (
            <button onClick={() => trigger("wishlist")}
              className="mb-3 w-full border border-neutral-300 py-4 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-black transition">
              <Heart className={`w-5 h-5 stroke-[1.5] ${isWishlisted ? "fill-black" : ""}`} />
              {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
          )}

          {flags.shareButton && (
            <button onClick={() => setSharePopup(true)}
              className="mb-8 w-full text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black flex items-center justify-center gap-2 py-3">
              <Share2 className="w-4 h-4 stroke-[1.5]" /> Share This Piece
            </button>
          )}

          {flags.pincodeCheck && <PincodeCheck />}

          <div className="space-y-4 border-t border-neutral-200 pt-8">
            <div className="flex items-center gap-4">
              <Truck className="w-6 h-6 stroke-[1.5] text-neutral-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.15em]">Complimentary Delivery</p>
                <p className="text-xs font-light text-neutral-500">2–4 Business Days</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RotateCcw className="w-6 h-6 stroke-[1.5] text-neutral-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.15em]">Easy Returns</p>
                <p className="text-xs font-light text-neutral-500">Within 30 Days</p>
              </div>
            </div>
          </div>

          <ProductAccordions product={product} />
        </div>
      </div>

      <MoreLikeThis product={product} />

      <SizePopup
        open={!!sizePopup}
        onClose={() => setSizePopup(null)}
        productId={product._id}
        productName={product.name}
        customSizes={Array.isArray((product as any).sizes) && (product as any).sizes.length > 0 ? (product as any).sizes : undefined}
        title={
          sizePopup === "bag" ? "Choose Size to Add" :
          sizePopup === "buynow" ? "Choose Size to Buy" :
          "Choose Size to Save"
        }
        onSelect={(size) => { const action = sizePopup; setSizePopup(null); if (action) performAction(size, action); }}
      />
      <SharePopup
        open={sharePopup}
        onClose={() => setSharePopup(false)}
        url={`/product/${product.slug}`}
        title={product.name}
      />
    </div>
  );
}
