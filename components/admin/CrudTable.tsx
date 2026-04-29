"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Loader2, Edit3 } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGalleryUpload from "./ImageGalleryUpload";

export interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date" | "datetime" | "image" | "gallery";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

interface Props {
  resource: string; // e.g. "coupons"
  fields: Field[];
  columns?: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  title?: string;
  defaultValues?: Record<string, any>;
}

export default function CrudTable({ resource, fields, columns, defaultValues = {} }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(defaultValues);
  const [saving, setSaving] = useState(false);

  const cols: { key: string; label: string; render?: (row: any) => React.ReactNode }[] =
    columns || fields.map((f) => ({ key: f.key, label: f.label }));

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/${resource}`, { cache: "no-store" });
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [resource]);

  function startNew() { setEditing({}); setForm({ ...defaultValues }); }
  function startEdit(row: any) { setEditing(row); setForm({ ...row }); }
  function cancel() { setEditing(null); setForm(defaultValues); }

  async function save() {
    setSaving(true);
    try {
      const isNew = !editing?._id;
      const r = await fetch(isNew ? `/api/${resource}` : `/api/${resource}/${editing._id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); alert(d.error || "Save failed"); return; }
      cancel(); await load();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={startNew} className="bg-black text-white px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition flex items-center gap-2">
          <Plus className="w-4 h-4 stroke-[1.5]" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : rows.length === 0 ? (
        <p className="py-20 text-center text-sm text-neutral-500">No items yet. Click &quot;Add New&quot; to create one.</p>
      ) : (
        <div className="border border-neutral-200 bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-neutral-500">{c.label}</th>
                ))}
                <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.15em] text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  {cols.map((c) => (
                    <td key={c.key} className="px-5 py-3 text-sm">
                      {c.render ? c.render(row) : formatVal(row[c.key])}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(row)} className="text-neutral-500 hover:text-black"><Edit3 className="w-4 h-4 stroke-[1.5]" /></button>
                      <button onClick={() => remove(row._id)} className="text-neutral-500 hover:text-[#8C001A]"><Trash2 className="w-4 h-4 stroke-[1.5]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={cancel} className="absolute top-4 right-4"><X className="w-6 h-6 stroke-[1.5]" /></button>
            <h3 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">{editing?._id ? "Edit" : "New"} Item</h3>
            <div className="space-y-4">
              {fields.map((f) => <FormField key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} />)}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={cancel} className="flex-1 border border-neutral-200 py-3 text-xs uppercase tracking-[0.2em] hover:border-black transition">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-black text-white py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatVal(v: any) {
  if (v === undefined || v === null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 40);
  return String(v);
}

function FormField({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void; }) {
  const lc = "block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2";
  const ic = "w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black";
  if (field.type === "textarea") return (
    <div><label className={lc}>{field.label}</label>
      <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} className={ic} placeholder={field.placeholder} />
    </div>
  );
  if (field.type === "select") return (
    <div><label className={lc}>{field.label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={ic}>
        <option value="">— Select —</option>
        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
  if (field.type === "checkbox") return (
    <label className="flex items-center gap-3 py-2"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-black" /><span className="text-sm">{field.label}</span></label>
  );
  if (field.type === "number") return (
    <div><label className={lc}>{field.label}</label>
      <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className={ic} placeholder={field.placeholder} />
    </div>
  );
  if (field.type === "image") return <ImageUpload label={field.label} value={value} onChange={onChange} />;
  if (field.type === "gallery") return <ImageGalleryUpload label={field.label} value={value} onChange={onChange} />;
  if (field.type === "datetime") return (
    <div><label className={lc}>{field.label}</label>
      <input type="datetime-local" value={value ? new Date(value).toISOString().slice(0,16) : ""} onChange={(e) => onChange(e.target.value)} className={ic} />
    </div>
  );
  if (field.type === "date") return (
    <div><label className={lc}>{field.label}</label>
      <input type="date" value={value ? new Date(value).toISOString().slice(0,10) : ""} onChange={(e) => onChange(e.target.value)} className={ic} />
    </div>
  );
  return (
    <div><label className={lc}>{field.label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={ic} placeholder={field.placeholder} />
    </div>
  );
}
