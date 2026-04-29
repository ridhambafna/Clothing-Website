"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, Loader2, Edit3, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon } from "lucide-react";
import PageShell from "@/components/admin/PageShell";

interface Page { _id?: string; slug: string; title: string; content: string; showInFooter?: boolean; }

export default function FooterPagesAdmin() {
  const [rows, setRows] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/footer-pages", { cache: "no-store" });
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function newOne() { setEditing({ slug: "", title: "", content: "", showInFooter: true }); }
  function close() { setEditing(null); }

  async function save() {
    if (!editing) return;
    if (!editing.slug?.trim() || !editing.title?.trim()) { alert("Slug and title required"); return; }
    setSaving(true);
    try {
      const isNew = !editing._id;
      const r = await fetch(isNew ? "/api/footer-pages" : `/api/footer-pages/${editing._id}`, {
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
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/footer-pages/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <PageShell title="Footer Pages" subtitle="Editable About Us, Privacy Policy, Terms, Returns, etc.">
      <div className="flex justify-end mb-6">
        <button onClick={newOne} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Page</button>
      </div>

      {loading ? <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        : rows.length === 0 ? <p className="py-20 text-center text-sm text-[#777]">No pages yet. Click &quot;Add Page&quot; to create one.</p>
        : (
          <div className="border border-[#E8E2D5] bg-white">
            <table className="w-full">
              <thead className="bg-[#F8F6F2] border-b border-[#E8E2D5]">
                <tr>{["Title","Slug","Visible","Actions"].map(h => <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#777]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p._id} className="border-b border-[#F0EBDF] last:border-b-0">
                    <td className="px-5 py-3 text-sm">{p.title}</td>
                    <td className="px-5 py-3 text-sm font-mono">/p/{p.slug}</td>
                    <td className="px-5 py-3 text-sm">{p.showInFooter ? "Yes" : "No"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => setEditing({ ...p })} className="text-neutral-500 hover:text-black"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => remove(p._id)} className="text-neutral-500 hover:text-[#8B1A1A]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {editing && <PageEditor page={editing} setPage={setEditing} onClose={close} onSave={save} saving={saving} />}
    </PageShell>
  );
}

function PageEditor({ page, setPage, onClose, onSave, saving }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);

  // Initialise editor once
  useEffect(() => {
    if (ref.current && !showHtml) ref.current.innerHTML = page.content || "";
  }, [showHtml]);

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    if (ref.current) setPage((p: any) => ({ ...p, content: ref.current!.innerHTML }));
  }

  function makeLink() {
    const url = prompt("URL");
    if (url) exec("createLink", url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4"><X className="w-6 h-6" /></button>
        <h3 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">{page._id ? "Edit" : "New"} Page</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Title</label>
            <input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#777] mb-2">Slug</label>
            <input value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full border border-[#E8E2D5] px-4 py-3 text-sm outline-none focus:border-[#C5A572] font-mono" placeholder="about-us" />
          </div>
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={!!page.showInFooter} onChange={(e) => setPage({ ...page, showInFooter: e.target.checked })} className="accent-[#C5A572]" />
          <span className="text-sm">Show this page link in footer</span>
        </label>

        <div className="border border-[#E8E2D5]">
          <div className="flex items-center gap-1 border-b border-[#E8E2D5] bg-[#F8F6F2] p-2">
            <ToolbarBtn onClick={() => exec("bold")}><Bold className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("italic")}><Italic className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("formatBlock", "<h2>")}><Heading1 className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("formatBlock", "<h3>")}><Heading2 className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("insertUnorderedList")}><List className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={makeLink}><LinkIcon className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("formatBlock", "<p>")}>Para</ToolbarBtn>
            <span className="ml-auto" />
            <ToolbarBtn onClick={() => setShowHtml(!showHtml)}>{showHtml ? "WYSIWYG" : "HTML"}</ToolbarBtn>
          </div>
          {showHtml ? (
            <textarea
              value={page.content || ""}
              onChange={(e) => setPage({ ...page, content: e.target.value })}
              rows={18}
              className="w-full p-4 text-sm font-mono outline-none"
            />
          ) : (
            <div ref={ref} contentEditable suppressContentEditableWarning
              onInput={(e) => setPage({ ...page, content: (e.currentTarget as HTMLDivElement).innerHTML })}
              className="min-h-[400px] p-4 text-sm leading-relaxed outline-none focus:outline-none [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:tracking-[0.15em] [&_h2]:text-[#C5A572] [&_h2]:my-4 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:uppercase [&_h3]:tracking-[0.15em] [&_h3]:my-3 [&_a]:text-[#C5A572] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_p]:my-2"
            />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-[#E8E2D5] py-3 text-xs uppercase tracking-[0.2em] hover:border-black">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? "Saving..." : "Save Page"}</button>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="px-2 py-1.5 text-xs hover:bg-white border border-transparent hover:border-[#E8E2D5] rounded">
      {children}
    </button>
  );
}
