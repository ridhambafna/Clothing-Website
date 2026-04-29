"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value?: string[] | string;
  onChange: (urls: string[]) => void;
  label?: string;
}

export default function ImageGalleryUpload({ value, onChange, label }: Props) {
  const list: string[] = Array.isArray(value)
    ? value
    : typeof value === "string" && value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Upload failed"); return null; }
    return data.url;
  }

  async function uploadFiles(files: FileList | File[]) {
    setError(""); setUploading(true);
    try {
      const next = [...list];
      for (const f of Array.from(files)) {
        const u = await uploadOne(f);
        if (u) next.push(u);
      }
      onChange(next);
    } finally { setUploading(false); }
  }

  function remove(i: number) { onChange(list.filter((_, idx) => idx !== i)); }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div>
      {label && <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">{label}</label>}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {list.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="" className="w-full h-32 object-cover border border-neutral-200" />
            <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`cursor-pointer border-2 border-dashed flex flex-col items-center justify-center gap-1 h-32 transition ${drag ? "border-black bg-neutral-50" : "border-neutral-300 hover:border-black"}`}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <Upload className="w-6 h-6 stroke-[1.5] text-neutral-400" />
              <p className="text-xs">Add image</p>
            </>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }} />
      {error && <p className="text-xs text-[#8C001A] mt-2">{error}</p>}
    </div>
  );
}
