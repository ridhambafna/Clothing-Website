import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";

const VALID_TAGS = new Set(["NEW", "BESTSELLER", "SALE"]);

function toArray(v: any): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function normalizeProductBody(body: any): any {
  const out = { ...body };
  if (out.tags !== undefined) out.tags = toArray(out.tags).map((t) => t.toUpperCase()).filter((t) => VALID_TAGS.has(t));
  if (out.sizes !== undefined) out.sizes = toArray(out.sizes);
  if (out.colors !== undefined) out.colors = toArray(out.colors);
  if (out.gallery !== undefined) out.gallery = toArray(out.gallery);
  if (!out.slug && out.name) out.slug = String(out.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // back-compat helpers from tags array
  if (Array.isArray(out.tags)) {
    out.newArrival = out.tags.includes("NEW");
    out.bestseller = out.tags.includes("BESTSELLER");
    out.onSale = out.tags.includes("SALE");
  }
  if (typeof out.stock === "number") out.inStock = out.stock > 0;
  return out;
}

import { Offer } from "@/lib/models";

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  
  const products = await Product.find().sort({ createdAt: -1 }).lean() as any[];
  
  const now = new Date();
  const activeOffers = await Offer.find({
    active: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
    ]
  }).lean() as any[];

  const productsWithOffers = products.map((p) => {
    let bestDiscount = 0;
    for (const offer of activeOffers) {
      if (offer.discountPercentage > 0) {
        // If productIds has items, it must include this product.
        const ids = Array.isArray(offer.productIds) ? offer.productIds.filter(Boolean) : [];
        if (ids.length === 0 || ids.includes(p._id.toString())) {
          if (offer.discountPercentage > bestDiscount) bestDiscount = offer.discountPercentage;
        }
      }
    }
    
    if (bestDiscount > 0) {
       p.originalPrice = p.price;
       p.price = Math.round(p.price * (1 - bestDiscount / 100));
       p.onSale = true;
       if (Array.isArray(p.tags) && !p.tags.includes("SALE")) p.tags.push("SALE");
       else if (!Array.isArray(p.tags)) p.tags = ["SALE"];
    }
    return p;
  });

  return NextResponse.json(productsWithOffers);
}

export async function POST(req: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = normalizeProductBody(await req.json());
    const doc = await Product.create(body);
    return NextResponse.json(doc.toObject());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
