"use client";

import PageShell from "@/components/admin/PageShell";
import CrudTable from "@/components/admin/CrudTable";

const FABRIC_TYPES = ["Cotton", "Linen", "Cotton-Linen Blend", "Silk", "Silk Blend", "Wool", "Polyester Blend"];

export default function ProductsPage() {
  return (
    <PageShell title="Products" subtitle="Manage your fabric catalog.">
      <CrudTable
        resource="products"
        defaultValues={{ inStock: true, stock: 10, tags: [], sizes: [] }}
        fields={[
          { key: "name", label: "Name", required: true },
          { key: "slug", label: "Slug", placeholder: "auto-generated if empty" },
          { key: "price", label: "Price (₹)", type: "number" },
          { key: "salePrice", label: "Sale Price (₹) — optional", type: "number" },
          { key: "image", label: "Main Image", type: "image" },
          { key: "gallery", label: "Gallery Images", type: "gallery" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "category", label: "Category", placeholder: "shirts | ethnic | linen" },
          { key: "collectionSlug", label: "Collection", placeholder: "e.g. checks, stripes" },
          {
            key: "fabricType", label: "Fabric Type", type: "select",
            options: FABRIC_TYPES.map((f) => ({ value: f, label: f }))
          },
          {
            key: "careInstructions", label: "Care Instructions", type: "textarea",
            placeholder: "e.g. Dry clean only. Iron on low heat."
          },
          { key: "sku", label: "SKU" },
          { key: "stock", label: "Stock Quantity", type: "number" },
          { key: "sizes", label: "Available Sizes (comma-separated)", placeholder: "S, M, L, XL" },
          { key: "tags", label: "Tags (comma-separated: NEW, BESTSELLER, SALE)", placeholder: "NEW, BESTSELLER" },
          { key: "inStock", label: "In Stock", type: "checkbox" },
          { key: "featured", label: "Featured on Homepage", type: "checkbox" },
        ]}
        columns={[
          { key: "image", label: "", render: (r) => r.image ? <img src={r.image} alt="" className="w-12 h-14 object-cover" /> : <div className="w-12 h-14 bg-neutral-100" /> },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price", render: (r) => `₹${(r.price || 0).toLocaleString("en-IN")}` },
          { key: "stock", label: "Stock", render: (r) => (r.stock ?? 0) },
          { key: "tags", label: "Tags", render: (r) => Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags || "—") },
        ]}
      />
      <p className="mt-6 text-xs text-neutral-500 max-w-2xl leading-relaxed">
        Tags appear as pill badges on the product card. Sizes are comma-separated. Stock under 5 triggers a low-stock warning on the dashboard.
      </p>
    </PageShell>
  );
}
