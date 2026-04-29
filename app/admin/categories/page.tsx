"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Loader2, Edit3 } from "lucide-react";
import PageShell from "@/components/admin/PageShell";
import ImageUpload from "@/components/admin/ImageUpload";

interface Collection { _id?: string; name: string; slug: string; description?: string; image?: string; showOnHome?: boolean; order?: number; productIds?: string[]; }
interface ProductLite { _id: string; name: string; image?: string; price: number; category?: string; }

export default function CategoriesPage() {
  const [rows, setRows] = useState<Collection[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        fetch("/api/collections", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
        fetch("/api/products", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
      ]);
      setRows(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p.map((x: any) => ({ _id: String(x._id), name: x.name, image: x.image, price: x.price, category: x.category })) : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function newOne() { setEditing({ name: "", slug: "", showOnHome: true, order: 0, productIds: [] }); setSearch(""); }
  function edit(c: Collection) { setEditing({ ...c, productIds: Array.isArray(c.productIds) ? c.productIds : [] }); setSearch(""); }
  function close() { setEditing(null); }

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) { alert("Name is required"); return; }
    if (!editing.slug?.trim()) { alert("Slug is required"); return; }
    setSaving(true);
    try {
      const isNew = !editing._id;
      const r = await fetch(isNew ? "/api/collections" : `/api/collections/${editing._id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); alert(d.error || "Save failed"); return; }
      close(); await load();
    } finally { setSaving(false); }
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Delete this collection?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    await load();
  }

  function toggleProduct(pid: string) {
    if (!editing) return;
    const ids = new Set(editing.productIds || []);
    if (ids.has(pid)) ids.delete(pid); else ids.add(pid);
    setEditing({ ...editing, productIds: Array.from(ids) });
  }

  const visibleProducts = search.trim() ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : products;

  return (
    <PageShell title="Collections & Categories" subtitle="Group products into collections. Use the checklist when editing to assign them.">
      <div className="flex justify-end mb-6">
        <button onClick={newOne} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add New</button>
      </div>

      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : rows.length === 0 ? <p className="py-20 text-center text-sm text-neutral-500">No collections yet.</p>
        : (
          <div className="border border-[#E8E2D5] bg-white">
            <table className="w-full">
              <thead className="border-b border-[#E8E2D5] bg-[#F8F6F2]">
                <tr>{["", "Name", "Slug", "Products", "On Home", "Order", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#777]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c._id} className="border-b border-[#F0EBDF] last:border-b-0 hover:bg-[#F8F6F2]">
                    <td className="px-5 py-3">{c.image ? <img src={c.image} alt="" className="w-12 h-14 object-cover" /> : <div className="w-12 h-14 bg-neutral-100" />}</td>
                    <td className="px-5 py-3 text-sm">{c.name}</td>
                    <td className="px-5 py-3 text-sm font-mono">/{c.slug}</td>
                    <td className="px-5 py-3 text-sm">{Array.isArray(c.productIds) ? c.productIds.length : 0}</td>
                    <td className="px-5 py-3 text-sm">{c.showOnHome ? "Yes" : "No"}</td>
                    <td className="px-5 py-3 text-sm">{c.order ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => edit(c)} className="text-neutral-500 hover:text-black"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => remove(c._id)} className="text-neutral-500 hover:text-[#8B1A1A]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={close} className="absolute top-4 right-4"><X className="w-6 h-6" /></button>
            <h3 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">{editing._id ? "Edit" : "New"} Collection</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Name</label>
                  <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Slug</label>
                  <input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572] font-mono" placeholder="shirting" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Description</label>
                <textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
              </div>
              <ImageUpload label="Banner Image" value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 mt-7">
                  <input type="checkbox" checked={!!editing.showOnHome} onChange={(e) => setEditing({ ...editing, showOnHome: e.target.checked })} className="w-4 h-4 accent-[#C5A572]" />
                  <span className="text-sm">Show on Homepage</span>
                </label>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Display Order</label>
                  <input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2D5]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.2em]">Assigned Products ({editing.productIds?.length || 0})</p>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter products..."
                    className="text-xs border border-[#E8E2D5] px-3 py-1.5 outline-none focus:border-[#C5A572] w-48" />
                </div>
                {products.length === 0 ? (
                  <p className="text-sm text-[#777] py-4">No products yet. Add products first to assign them.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-[#E8E2D5]">
                    {visibleProducts.map((p) => {
                      const checked = editing.productIds?.includes(p._id) || false;
                      return (
                        <label key={p._id} className={`flex items-center gap-3 px-3 py-2 border-b border-[#F0EBDF] last:border-b-0 cursor-pointer hover:bg-[#F8F6F2] ${checked ? "bg-[#FAF7F0]" : ""}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleProduct(p._id)} className="w-4 h-4 accent-[#C5A572]" />
                          <div className="w-10 h-12 flex-shrink-0 bg-neutral-100 overflow-hidden">{p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}</div>
                          <div className="flex-1">
                            <p className="text-sm">{p.name}</p>
                            <p className="text-xs text-[#777] capitalize">{p.category || "—"}</p>
                          </div>
                          <p className="text-xs text-[#777]">₹{(p.price || 0).toLocaleString("en-IN")}</p>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={close} className="flex-1 border border-[#E8E2D5] py-3 text-xs uppercase tracking-[0.2em] hover:border-black transition">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
