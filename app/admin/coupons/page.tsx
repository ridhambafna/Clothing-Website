"use client";

import PageShell from "@/components/admin/PageShell";
import CrudTable from "@/components/admin/CrudTable";

export default function CouponsPage() {
  return (
    <PageShell title="Coupons" subtitle="Promo codes for checkout.">
      <CrudTable
        resource="coupons"
        defaultValues={{ active: true, type: "percent", value: 10, minOrder: 0 }}
        fields={[
          { key: "code", label: "Code", required: true, placeholder: "FESTIVE15" },
          { key: "type", label: "Type", type: "select", options: [{ value: "flat", label: "Flat ₹" }, { value: "percent", label: "Percent %" }] },
          { key: "value", label: "Value", type: "number" },
          { key: "minOrder", label: "Minimum Order", type: "number" },
          { key: "expiry", label: "Expiry", type: "date" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
        columns={[
          { key: "code", label: "Code", render: (r) => <span className="font-mono">{r.code}</span> },
          { key: "type", label: "Type" },
          { key: "value", label: "Value", render: (r) => r.type === "percent" ? `${r.value}%` : `₹${r.value}` },
          { key: "minOrder", label: "Min Order", render: (r) => `₹${r.minOrder || 0}` },
          { key: "expiry", label: "Expiry", render: (r) => r.expiry ? new Date(r.expiry).toLocaleDateString() : "—" },
          { key: "active", label: "Active", render: (r) => r.active ? "Yes" : "No" },
        ]}
      />
    </PageShell>
  );
}
