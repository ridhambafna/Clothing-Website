"use client";

import PageShell from "@/components/admin/PageShell";
import CrudTable from "@/components/admin/CrudTable";

function offerStatus(r: any): { label: string; cls: string } {
  if (!r.active) return { label: "Inactive", cls: "bg-neutral-100 text-neutral-600" };
  const now = Date.now();
  const start = r.startsAt ? new Date(r.startsAt).getTime() : null;
  const end = r.endsAt ? new Date(r.endsAt).getTime() : null;
  if (start && now < start) return { label: "Scheduled", cls: "bg-blue-50 text-blue-700" };
  if (end && now > end) return { label: "Expired", cls: "bg-neutral-200 text-neutral-700" };
  return { label: "Active", cls: "bg-green-50 text-green-700" };
}

export default function OffersPage() {
  return (
    <PageShell title="Offers" subtitle="Schedule offers and toggle visibility on the announcement bar.">
      <CrudTable
        resource="offers"
        defaultValues={{ active: true, showOnBar: false, linkType: "collection" }}
        fields={[
          { key: "title", label: "Title", required: true, placeholder: "e.g. Festive Edit" },
          { key: "image", label: "Image (optional)", type: "image" },
          { key: "description", label: "Description", type: "textarea", placeholder: "15% off your first order" },
          {
            key: "linkType", label: "Link Type", type: "select", options: [
              { value: "collection", label: "Collection" },
              { value: "product", label: "Product" },
              { value: "url", label: "Custom URL" },
            ]
          },
          { key: "linkValue", label: "Link Value", placeholder: "/collections/ethnic or product slug or URL" },
          { key: "startsAt", label: "Starts At", type: "datetime" },
          { key: "endsAt", label: "Ends At", type: "datetime" },
          { key: "showOnBar", label: "Show on Announcement Bar", type: "checkbox" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
        columns={[
          { key: "title", label: "Title" },
          {
            key: "schedule", label: "Schedule", render: (r) => {
              const s = r.startsAt ? new Date(r.startsAt).toLocaleDateString() : "—";
              const e = r.endsAt ? new Date(r.endsAt).toLocaleDateString() : "—";
              return <span className="text-xs">{s} → {e}</span>;
            }
          },
          {
            key: "status", label: "Status", render: (r) => {
              const s = offerStatus(r);
              return <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 ${s.cls}`}>{s.label}</span>;
            }
          },
          { key: "showOnBar", label: "On Bar", render: (r) => r.showOnBar ? "Yes" : "No" },
        ]}
      />
    </PageShell>
  );
}
