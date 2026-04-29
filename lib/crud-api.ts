import { NextRequest, NextResponse } from "next/server";
import { Model } from "mongoose";
import { connectDB } from "@/lib/db";

export function makeCrud(model: Model<any>, options?: { listSort?: any; defaultListQuery?: any; }) {
  return {
    async list(req?: NextRequest, q: any = {}) {
      const conn = await connectDB();
      if (!conn) return NextResponse.json([]);
      const docs = await model.find({ ...(options?.defaultListQuery || {}), ...q }).sort(options?.listSort || { createdAt: -1 }).lean();
      return NextResponse.json(docs);
    },
    async create(req: NextRequest) {
      const conn = await connectDB();
      if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
      try {
        const body = await req.json();
        const doc = await model.create(body);
        return NextResponse.json(doc.toObject());
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    },
    async update(req: NextRequest, id: string) {
      const conn = await connectDB();
      if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
      try {
        const body = await req.json();
        const doc = await model.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(doc);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    },
    async remove(id: string) {
      const conn = await connectDB();
      if (!conn) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
      await model.findByIdAndDelete(id);
      return NextResponse.json({ ok: true });
    },
  };
}
