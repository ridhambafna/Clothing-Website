"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Upload failed"); return; }
      onChange(data.url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  return (
    <div>
      {label && <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">{label}</label>}
      {value ? (
        <div className="relative inline-block group">
          <img src={value} alt="" className="w-full max-w-xs h-48 object-cover border border-neutral-200" />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white shadow opacity-0 group-hover:opacity-100 transition">
            <X className="w-4 h-4 stroke-[2]" />
          </button>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="block mt-2 text-xs uppercase tracking-[0.2em] underline">
            Replace image
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`cursor-pointer border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 px-6 transition ${drag ? "border-black bg-neutral-50" : "border-neutral-300 hover:border-black"}`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 stroke-[1.5] text-neutral-400" />
              <p className="text-sm">Drop image here or <span className="underline">browse</span></p>
              <p className="text-xs text-neutral-400">JPG, PNG, WEBP — up to 8 MB</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {error && <p className="text-xs text-[#8C001A] mt-2">{error}</p>}
    </div>
  );
}
