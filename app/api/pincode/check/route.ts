import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Settings } from "@/lib/models";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim();
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ available: false, error: "Enter a valid 6-digit pincode" }, { status: 400 });

  // Read pan-India settings (defaults: enabled, 4 days)
  let panIndia = true; let deliveryDays = 4; let excluded: string[] = [];
  try {
    const conn = await connectDB();
    if (conn) {
      const doc = await Settings.findOne({ key: "delivery" }).lean() as any;
      if (doc?.value) {
        panIndia = doc.value.panIndia !== false;
        deliveryDays = typeof doc.value.deliveryDays === "number" ? doc.value.deliveryDays : 4;
        excluded = Array.isArray(doc.value.excludedPincodes) ? doc.value.excludedPincodes : [];
      }
    }
  } catch {}

  if (excluded.includes(code)) return NextResponse.json({ available: false, error: "Not serviceable" });

  // Verify pincode exists via postalpincode.in (free, public)
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${code}`, { cache: "no-store" });
    const data = await r.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (entry?.Status === "Success" && Array.isArray(entry.PostOffice) && entry.PostOffice.length > 0 && panIndia) {
      const po = entry.PostOffice[0];
      return NextResponse.json({ available: true, city: po.District || po.Block || "", state: po.State || "", deliveryDays });
    }
    return NextResponse.json({ available: false });
  } catch {
    // Fall back: if pan-India and we can't verify, accept any valid 6-digit code
    if (panIndia) return NextResponse.json({ available: true, deliveryDays });
    return NextResponse.json({ available: false });
  }
}
