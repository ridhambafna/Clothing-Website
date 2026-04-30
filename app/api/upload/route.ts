import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG/PNG/WEBP/GIF/AVIF supported" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 8 MB" }, { status: 400 });
    }

    // Convert file to base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "millazo-products",
      resource_type: "image",
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // auto-optimize
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
