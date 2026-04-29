"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/PageShell";

interface Link { _id: string; label: string; href: string; parentId?: string; order: number; active: boolean; }

export default function NavbarAdmin() {
  // We fetch the FLAT list directly from a special route
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/navbar/all", { cache: "no-store" });
      const data = r.ok ? await r.json() : [];
      setLinks(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function addLink(parentId?: string) {
    const label = prompt(parentId ? "Submenu label" : "Nav link label");
    if (!label) return;
    const href = prompt("URL (e.g. /collections/shirting)") || "/";
    const order = links.filter((l) => l.parentId === parentId).length;
    await fetch("/api/navbar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, parentId: parentId || null, order, active: true }),
    });
    await load();
  }

  async function update(id: string, patch: any) {
    await fetch(`/api/navbar/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this link (and any submenus)?")) return;
    await fetch(`/api/navbar/${id}`, { method: "DELETE" });
    await load();
  }

  async function move(l: Link, dir: -1 | 1) {
    const siblings = links.filter((x) => (x.parentId || null) === (l.parentId || null)).sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((x) => x._id === l._id);
    const swap = siblings[idx + dir];
    if (!swap) return;
    await Promise.all([
      update(l._id, { order: swap.order }),
      update(swap._id, { order: l.order }),
    ]);
  }

  const tops = links.filter((l) => !l.parentId).sort((a, b) => a.order - b.order);

  return (
    <PageShell title="Manage Navbar" subtitle="Add, remove, and reorder navigation links. Saves live.">
      <div className="flex justify-end mb-6">
        <button onClick={() => addLink()} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Link</button>
      </div>

      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : tops.length === 0 ? <p className="py-20 text-center text-sm text-[#777]">No links yet. The storefront uses fallback links until you add some.</p>
        : (
          <div className="space-y-3 max-w-3xl">
            {tops.map((l) => {
              const subs = links.filter((x) => x.parentId === l._id).sort((a, b) => a.order - b.order);
              return (
                <div key={l._id} className="border border-[#E8E2D5] bg-white">
                  <Row link={l} onMoveUp={() => move(l, -1)} onMoveDown={() => move(l, 1)} onUpdate={(p: any) => update(l._id, p)} onDelete={() => remove(l._id)} onAddSub={() => addLink(l._id)} />
                  {subs.length > 0 && (
                    <div className="border-t border-[#F0EBDF] pl-8">
                      {subs.map((s) => (
                        <Row key={s._id} link={s} sub onMoveUp={() => move(s, -1)} onMoveDown={() => move(s, 1)} onUpdate={(p: any) => update(s._id, p)} onDelete={() => remove(s._id)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </PageShell>
  );
}

function Row({ link, sub, onMoveUp, onMoveDown, onUpdate, onDelete, onAddSub }: any) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(link.label);
  const [href, setHref] = useState(link.href);

  async function save() {
    await onUpdate({ label, href });
    setEditing(false);
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${sub ? "border-b border-[#F0EBDF] last:border-b-0" : ""}`}>
      <button onClick={onMoveUp} className="text-[#777] hover:text-black"><ArrowUp className="w-4 h-4" /></button>
      <button onClick={onMoveDown} className="text-[#777] hover:text-black"><ArrowDown className="w-4 h-4" /></button>
      <div className="flex-1">
        {editing ? (
          <div className="flex gap-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="border border-[#E8E2D5] px-3 py-1.5 text-sm" />
            <input value={href} onChange={(e) => setHref(e.target.value)} className="border border-[#E8E2D5] px-3 py-1.5 text-sm flex-1 font-mono" />
            <button onClick={save} className="btn-primary px-4 py-1.5 text-[10px]">Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-left">
            <p className="text-sm">{link.label}</p>
            <p className="text-xs text-[#777] font-mono">{link.href}</p>
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={link.active !== false} onChange={(e) => onUpdate({ active: e.target.checked })} className="accent-[#C5A572]" />
        Active
      </label>
      {!sub && onAddSub && (
        <button onClick={onAddSub} title="Add submenu link" className="text-xs uppercase tracking-[0.15em] text-[#C5A572] hover:underline">+ Sub</button>
      )}
      <button onClick={onDelete} className="text-[#777] hover:text-[#8B1A1A]"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
