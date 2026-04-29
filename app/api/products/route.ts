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

export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json([]);
  return NextResponse.json(await Product.find().sort({ createdAt: -1 }).lean());
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
