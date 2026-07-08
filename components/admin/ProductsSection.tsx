"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";

// ── Types ──────────────────────────────────────────────────────────

interface Variant {
  id:        string;
  size:      string;
  color:     string;
  colorHex?: string | null;
  stock:     number;
  price:     number;
  salePrice?: number | null;
}

interface ProductCategory {
  id:   string;
  name: string;
  slug: string;
}

interface SizeGuideImage {
  url:          string;
  optimizedUrl: string;
}

interface Product {
  id:           string;
  name:         string;
  slug:         string;
  sku:          string;
  description?: string | null;
  tab1Title?:   string | null;
  tab1Content?: string | null;
  basePrice:    number;
  salePrice?:   number | null;
  status:       "Active" | "Draft" | "Archived";
  isFeatured:   boolean;
  sortOrder:    number;
  totalStock:   number;
  wishlistCount: number;
  category:     ProductCategory;
  image?:       { url: string; altText?: string | null } | null;
  variants:     Variant[];
  reviewCount:  number;
  sizeGuideImage1?: SizeGuideImage | null;
  sizeGuideImage2?: SizeGuideImage | null;
  createdAt:    string;
  updatedAt:    string;
}

interface CategoryOption {
  id:   string;
  name: string;
  slug: string;
}

interface ProductImageDTO {
  id:           string;
  url:          string;
  optimizedUrl: string | null;
  thumbnailUrl: string | null;
  publicId:     string | null;
  altText:      string | null;
  position:     number;
  isDefault:    boolean;
}

type ProductsView = "list" | "add" | "edit";

interface FormData {
  name:           string;
  sku:            string;
  categoryId:     string;
  description:    string;
  tab1Title:      string;
  tab1Content:    string;
  price:          string;
  salePrice:      string;
  sizeQuantities: Record<string, string>;
  sizes:          string[];
  colors:         string[];
  status:         "Active" | "Draft" | "Archived";
  isFeatured:     boolean;
}

type FormErrors = Partial<Record<keyof FormData | "general", string>>;

// ── Constants ──────────────────────────────────────────────────────

const ALL_SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];
const ALL_COLORS = ["Ivory", "Black", "Crimson", "Peach", "Aqua", "Gold", "Navy", "Sage", "Berry", "Rose", "Silver", "Blush"];
const ITEMS_PER_PAGE = 8;

// ── Utilities ──────────────────────────────────────────────────────

function fp(n: number) { return `Rs. ${n.toLocaleString("en-PK")}`; }

// ── Micro components ───────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StatusBadge({ status }: { status: "Active" | "Draft" | "Archived" }) {
  const cls =
    status === "Active"   ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" :
    status === "Archived" ? "bg-orange-50 text-orange-500 ring-1 ring-orange-200"   :
                            "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  return (
    <span className={`inline-block text-[10px] tracking-[0.08em] uppercase font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

function StockCell({ stock }: { stock: number }) {
  const cls = stock === 0 ? "text-red-500" : stock <= 3 ? "text-red-400" : stock <= 10 ? "text-amber-500" : "text-emerald-600";
  return <span className={`text-[12px] font-medium ${cls}`}>{stock === 0 ? "Out of stock" : `${stock}`}</span>;
}

function ProductThumb({ src }: { src?: string | null }) {
  if (src) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#EDE8E1] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-[#EDE8E1] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#B8A99A]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    </div>
  );
}

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

// ── Form helpers ───────────────────────────────────────────────────

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[13px] font-semibold text-slate-800">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-slate-700 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ── Product Image Editor ───────────────────────────────────────────

function ProductImageEditor({ productSlug, productId }: { productSlug: string; productId: string }) {
  const [images,        setImages]        = useState<ProductImageDTO[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [uploading,     setUploading]     = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [error,         setError]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);

  async function loadImages() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/products/${productSlug}/images`);
      const json = await res.json();
      if (json.success) setImages(json.data ?? []);
    } catch {
      setError("Failed to load images.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadMany(files: File[]) {
    if (uploading || files.length === 0) return;
    setError("");

    const valid: File[] = [];
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(`"${file.name}" is not supported — use JPEG, PNG, or WebP.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      valid.push(file);
    }

    setUploading(true);
    setUploadingCount(valid.length);

    const results = await Promise.allSettled(
      valid.map(async (file) => {
        const fd = new FormData();
        fd.append("file",       file);
        fd.append("uploadType", "product");
        fd.append("productId",  productId);
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Upload failed.");
        return json.data as ProductImageDTO;
      }),
    );

    const succeeded = results
      .filter((r): r is PromiseFulfilledResult<ProductImageDTO> => r.status === "fulfilled")
      .map(r => r.value);
    const failedCount = results.filter(r => r.status === "rejected").length;

    if (succeeded.length > 0) setImages(prev => [...prev, ...succeeded]);
    if (failedCount > 0) setError(`${failedCount} image${failedCount > 1 ? "s" : ""} failed to upload. Please try again.`);

    setUploading(false);
    setUploadingCount(0);
  }

  async function handleDelete(img: ProductImageDTO) {
    setDeletingId(img.id);
    setError("");
    try {
      const res  = await fetch(`/api/products/${productSlug}/images/${img.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to delete."); return; }
      await loadImages();
    } catch {
      setError("Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(img: ProductImageDTO) {
    setError("");
    try {
      const res  = await fetch(`/api/products/${productSlug}/images/${img.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isDefault: true }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to set default."); return; }
      setImages(prev => prev.map(i => ({ ...i, isDefault: i.id === img.id })));
    } catch {
      setError("Network error.");
    }
  }

  async function handleMove(imageId: string, dir: "up" | "down") {
    const idx    = images.findIndex(i => i.id === imageId);
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const reordered = [...images];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const withPos = reordered.map((img, i) => ({ ...img, position: i }));
    setImages(withPos);

    try {
      await fetch(`/api/products/${productSlug}/images`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(withPos.map(img => ({ id: img.id, position: img.position }))),
      });
    } catch {
      setImages(images);
    }
  }

  async function handleAltTextBlur(imageId: string, altText: string) {
    try {
      await fetch(`/api/products/${productSlug}/images/${imageId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ altText: altText.trim() || null }),
      });
    } catch {
      // silent
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUploadMany(files);
  }

  return (
    <FormCard title="Product Images">
      {error && (
        <div className="mb-3 text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={img.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              {/* Preview */}
              <div className="relative aspect-[4/5] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnailUrl ?? img.url}
                  alt={img.altText ?? ""}
                  className="w-full h-full object-cover"
                />
                {img.isDefault && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-semibold uppercase tracking-wide bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <span className="absolute top-1.5 right-1.5 text-[9px] font-mono bg-black/50 text-white px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </span>
              </div>

              {/* Controls */}
              <div className="p-2 space-y-2">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleMove(img.id, "up")}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMove(img.id, "down")}
                    disabled={idx === images.length - 1}
                    aria-label="Move down"
                    className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className="flex-1" />
                  {!img.isDefault && (
                    <button
                      onClick={() => handleSetDefault(img)}
                      aria-label="Set as default"
                      title="Set as default image"
                      className="p-1 rounded text-slate-500 hover:text-amber-500 hover:bg-amber-50 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deletingId === img.id}
                    aria-label="Delete image"
                    className="p-1 rounded text-slate-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
                  >
                    {deletingId === img.id ? <Spinner /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>

                <input
                  value={img.altText ?? ""}
                  onChange={e => setImages(prev => prev.map(i => i.id === img.id ? { ...i, altText: e.target.value } : i))}
                  onBlur={e => handleAltTextBlur(img.id, e.target.value)}
                  placeholder="Alt text…"
                  className="w-full text-[11px] border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:border-slate-400 placeholder-slate-300 text-slate-600 bg-slate-50/60"
                />
              </div>
            </div>
          ))}

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center aspect-[4/5] transition-all ${
              uploading
                ? "border-slate-200 bg-slate-50/50 cursor-not-allowed"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 cursor-pointer"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
              {uploading ? <Spinner /> : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>
            <p className="text-[11px] font-medium text-slate-600 text-center px-2">
              {uploading
                ? uploadingCount > 1 ? `Uploading ${uploadingCount} images…` : "Uploading…"
                : "Add images"}
            </p>
            <p className="text-[10px] text-slate-500 text-center mt-0.5 px-2">Click or drag &amp; drop · select multiple</p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) handleUploadMany(files);
          e.target.value = "";
        }}
      />

      {images.length === 0 && !loading && (
        <p className="text-[11px] text-slate-500 mt-3">
          No images yet. Upload at least one image to display your product in the store.
        </p>
      )}
    </FormCard>
  );
}

// ── Size Guide Editor ──────────────────────────────────────────────

function SizeGuideEditor({ product }: { product: Product }) {
  const [images, setImages] = useState<(SizeGuideImage | null)[]>([
    product.sizeGuideImage1 ?? null,
    product.sizeGuideImage2 ?? null,
  ]);
  const [uploading, setUploading] = useState<(boolean)[]>([false, false]);
  const [deleting,  setDeleting]  = useState<(boolean)[]>([false, false]);
  const [error,     setError]     = useState("");
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const fileRefs = [fileRef1, fileRef2];

  async function handleUpload(slot: 1 | 2, file: File) {
    const idx = slot - 1;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, or WebP files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the 5 MB limit.");
      return;
    }
    setError("");
    setUploading(prev => { const next = [...prev]; next[idx] = true; return next; });
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", String(slot));
      const res  = await fetch(`/api/products/${product.slug}/size-guide`, { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Upload failed."); return; }
      setImages(prev => { const next = [...prev]; next[idx] = json.data; return next; });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(prev => { const next = [...prev]; next[idx] = false; return next; });
    }
  }

  async function handleDelete(slot: 1 | 2) {
    const idx = slot - 1;
    setError("");
    setDeleting(prev => { const next = [...prev]; next[idx] = true; return next; });
    try {
      const res  = await fetch(`/api/products/${product.slug}/size-guide?slot=${slot}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Delete failed."); return; }
      setImages(prev => { const next = [...prev]; next[idx] = null; return next; });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(prev => { const next = [...prev]; next[idx] = false; return next; });
    }
  }

  return (
    <FormCard title="Size Guide Images">
      {error && (
        <div className="mb-3 text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {([1, 2] as const).map((slot) => {
          const idx  = slot - 1;
          const img  = images[idx];
          const busy = uploading[idx] || deleting[idx];

          return (
            <div key={slot} className="space-y-2">
              <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Slot {slot}</p>

              {img ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.optimizedUrl}
                    alt={`Size guide ${slot}`}
                    className="w-full aspect-[3/4] object-contain"
                  />
                  <div className="absolute bottom-0 inset-x-0 flex gap-1.5 p-2 bg-white/90 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => fileRefs[idx].current?.click()}
                      className="flex-1 text-[11px] font-medium py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 disabled:opacity-50 transition-colors"
                    >
                      {uploading[idx] ? "Uploading…" : "Replace"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(slot)}
                      className="flex-1 text-[11px] font-medium py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {deleting[idx] ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !busy && fileRefs[idx].current?.click()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center aspect-[3/4] transition-all ${
                    busy
                      ? "border-slate-200 bg-slate-50/50 cursor-not-allowed"
                      : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 cursor-pointer"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                    {uploading[idx] ? <Spinner /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 text-center px-2">
                    {uploading[idx] ? "Uploading…" : "Upload image"}
                  </p>
                  <p className="text-[10px] text-slate-500 text-center mt-0.5 px-2">JPEG, PNG, WebP · 5 MB max</p>
                </div>
              )}

              <input
                ref={fileRefs[idx]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(slot, file);
                  e.target.value = "";
                }}
              />
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        These images appear in a &ldquo;Size Guide&rdquo; modal on the product page. Upload a size chart or measurement guide.
      </p>
    </FormCard>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────

function DeleteModal({
  product,
  onCancel,
  onConfirm,
}: {
  product: Product;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch {
      setError("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onCancel} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-[15px] font-semibold text-slate-800 mb-2">Delete Product</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-700">&ldquo;{product.name}&rdquo;</span>?
            This action cannot be undone.
          </p>
          {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium border border-slate-200 rounded-xl text-slate-600 hover:border-slate-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {deleting ? <><Spinner />Deleting…</> : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Form (Add / Edit) ──────────────────────────────────────

function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product?:   Product;
  categories: CategoryOption[];
  onSave:     (data: FormData) => Promise<void>;
  onCancel:   () => void;
}) {
  const isEdit = !!product;

  const initialSizes  = product ? [...new Set(product.variants.map(v => v.size))]  : [];
  const initialColors = product ? [...new Set(product.variants.map(v => v.color))] : [];

  const initialSizeQuantities: Record<string, string> = {};
  if (product) {
    initialSizes.forEach(size => {
      const v = product.variants.find(v => v.size === size);
      initialSizeQuantities[size] = v ? String(v.stock) : "0";
    });
  }

  const [form, setForm] = useState<FormData>({
    name:           product?.name         ?? "",
    sku:            product?.sku          ?? "",
    categoryId:     product?.category?.id ?? "",
    description:    product?.description  ?? "",
    tab1Title:      product?.tab1Title   ?? "",
    tab1Content:    product?.tab1Content ?? "",
    price:          product?.basePrice    ? String(product.basePrice)  : "",
    salePrice:      product?.salePrice    ? String(product.salePrice)  : "",
    sizeQuantities: initialSizeQuantities,
    sizes:          initialSizes,
    colors:         initialColors,
    status:         (product?.status as FormData["status"]) ?? "Active",
    isFeatured:     product?.isFeatured ?? false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  const totalStock = useMemo(
    () => form.sizes.reduce((sum, size) => {
      const qty = parseInt(form.sizeQuantities[size] || "0", 10);
      return sum + (isNaN(qty) || qty < 0 ? 0 : qty);
    }, 0),
    [form.sizes, form.sizeQuantities],
  );

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim())                                              errs.name       = "Product name is required";
    else if (form.name.trim().length < 2)                               errs.name       = "Name must be at least 2 characters";
    if (!form.sku.trim())                                               errs.sku        = "SKU is required";
    if (!form.categoryId)                                               errs.categoryId = "Please select a category";
    if (!form.price)                                                    errs.price      = "Price is required";
    else if (isNaN(+form.price) || +form.price <= 0)                   errs.price      = "Enter a valid price";
    if (form.salePrice && +form.salePrice >= +form.price)              errs.salePrice  = "Sale price must be less than regular price";
    if (form.salePrice && (isNaN(+form.salePrice) || +form.salePrice < 0)) errs.salePrice = "Enter a valid sale price";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(status: "Active" | "Draft" | "Archived") {
    if (!validate()) return;
    setSaving(status === "Active" ? "publish" : "draft");
    try {
      await onSave({ ...form, status });
      setSaving(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save product";
      setErrors(prev => ({ ...prev, general: msg }));
      setSaving(null);
    }
  }

  function setField(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  const inp = (err?: string) =>
    `w-full border ${err ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400"} rounded-lg px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 bg-white outline-none transition-colors`;

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Products
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-[12px] text-slate-700 font-medium">{isEdit ? form.name || "Edit Product" : "Add Product"}</span>
        </div>

        {/* View on Website — only when editing an existing Active product */}
        {isEdit && product && (
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title={product.status !== "Active" ? `Product is ${product.status} — not visible to customers` : "View on website"}
            className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              product.status === "Active"
                ? "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                : "border-slate-200 text-slate-500 cursor-help"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            View on Website
            {product.status !== "Active" && (
              <span className="ml-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                {product.status}
              </span>
            )}
          </a>
        )}
      </div>

      <h1 className="text-xl font-semibold text-slate-800 mb-6">{isEdit ? "Edit Product" : "Add Product"}</h1>

      {errors.general && (
        <div className="mb-5 border border-red-200 bg-red-50 text-red-600 text-[12px] px-4 py-3 rounded-xl">
          {errors.general}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Product Information */}
          <FormCard title="Product Information">
            <div className="space-y-4">
              <FormField label="Product Name" error={errors.name} required>
                <input
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  placeholder="e.g. Pearl Treasure"
                  className={inp(errors.name)}
                />
              </FormField>
              <FormField label="Description">
                <RichTextEditor
                  value={form.description}
                  onChange={val => setField("description", val)}
                  placeholder="Describe your product — fabric, style, occasion…"
                />
              </FormField>
            </div>
          </FormCard>

          {/* Custom Tab */}
          <FormCard title="Custom Product Tab">
            <p className="text-[12px] text-slate-600 mb-4">
              This tab appears on the product page below the description. Leave blank to hide it.
            </p>
            <div className="flex flex-col gap-4">
              <FormField label="Tab Heading">
                <input
                  type="text"
                  value={form.tab1Title}
                  onChange={e => setField("tab1Title", e.target.value)}
                  placeholder="e.g. Composition, Fabric Details, About this piece…"
                  className={inp()}
                />
              </FormField>
              <FormField label="Tab Content">
                <RichTextEditor
                  value={form.tab1Content}
                  onChange={val => setField("tab1Content", val)}
                  placeholder="Enter the tab content — fabric, care notes, materials…"
                />
              </FormField>
            </div>
          </FormCard>

          {/* Pricing */}
          <FormCard title="Pricing">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Price (Rs.)" error={errors.price} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-500 pointer-events-none">Rs.</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setField("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    className={`${inp(errors.price)} pl-9`}
                  />
                </div>
              </FormField>
              <FormField label="Sale Price (Rs.)" error={errors.salePrice}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-500 pointer-events-none">Rs.</span>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={e => setField("salePrice", e.target.value)}
                    placeholder="Leave blank if no sale"
                    min="0"
                    className={`${inp(errors.salePrice)} pl-9`}
                  />
                </div>
              </FormField>
            </div>
          </FormCard>

          {/* Inventory */}
          <FormCard title="Inventory">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="SKU" error={errors.sku} required>
                  <input
                    value={form.sku}
                    onChange={e => setField("sku", e.target.value)}
                    placeholder="e.g. MN-FC-001"
                    className={inp(errors.sku)}
                  />
                </FormField>
                <FormField label="Total Stock Quantity">
                  <div className="relative">
                    <input
                      type="number"
                      value={totalStock}
                      readOnly
                      tabIndex={-1}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-600 bg-slate-50 outline-none cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500 uppercase tracking-wider pointer-events-none">
                      Auto
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Calculated from size quantities below</p>
                </FormField>
              </div>

              {form.sizes.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium text-slate-700 mb-3">Stock by Size</p>
                  <div className="space-y-2.5">
                    {ALL_SIZES.filter(s => form.sizes.includes(s)).map(size => (
                      <div key={size} className="flex items-center gap-3">
                        <span className="text-[12px] font-semibold text-slate-600 w-9 shrink-0">{size}</span>
                        <input
                          type="number"
                          min="0"
                          value={form.sizeQuantities[size] ?? "0"}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => ({
                              ...f,
                              sizeQuantities: { ...f.sizeQuantities, [size]: val },
                            }));
                          }}
                          className="w-28 border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 text-[13px] text-slate-800 bg-white outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormCard>

          {/* Variants */}
          <FormCard title="Variants">
            <div className="space-y-5">
              <FormField label="Size Options">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_SIZES.map((size) => {
                    const active = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const next = active ? form.sizes.filter(s => s !== size) : [...form.sizes, size];
                          setForm(f => ({
                            ...f,
                            sizes: next,
                            sizeQuantities: active ? f.sizeQuantities : {
                              ...f.sizeQuantities,
                              [size]: f.sizeQuantities[size] ?? "0",
                            },
                          }));
                        }}
                        className={`px-3 py-1.5 text-[12px] font-medium border rounded-lg transition-all ${
                          active ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Color Options">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_COLORS.map((color) => {
                    const active = form.colors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const next = active ? form.colors.filter(c => c !== color) : [...form.colors, color];
                          setForm(f => ({ ...f, colors: next }));
                        }}
                        className={`px-3 py-1.5 text-[12px] font-medium border rounded-lg transition-all ${
                          active ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <p className="text-[11px] text-slate-500">
                Variants will be created for each size × color combination. Stock is set per size — all colors of the same size share that quantity.
              </p>
            </div>
          </FormCard>

          {/* Product Images */}
          {isEdit && product ? (
            <>
              <ProductImageEditor productSlug={product.slug} productId={product.id} />
              <SizeGuideEditor product={product} />
            </>
          ) : (
            <FormCard title="Product Images">
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Image upload unlocks after saving</p>
                  <p className="text-[12px] text-slate-500 mt-1 max-w-xs">
                    Save the product first (as Draft or Published), then upload and manage images here.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Step 1: Fill in details &amp; save
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Step 2: Upload images
                  </span>
                </div>
              </div>
            </FormCard>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Status */}
          <FormCard title="Status">
            <div className="space-y-2">
              {(["Active", "Draft", "Archived"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all ${
                    form.status === s ? "border-slate-800 bg-slate-50" : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => setForm(f => ({ ...f, status: s }))}
                    className="accent-slate-800"
                  />
                  <div>
                    <p className="text-[12px] font-medium text-slate-800">{s}</p>
                    <p className="text-[11px] text-slate-500">
                      {s === "Active" ? "Visible in store" : s === "Draft" ? "Hidden from store" : "No longer available"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </FormCard>

          {/* Organization */}
          <FormCard title="Organization">
            <FormField label="Category" error={errors.categoryId} required>
              <div className="relative">
                <select
                  value={form.categoryId}
                  onChange={e => {
                    setForm(f => ({ ...f, categoryId: e.target.value }));
                    if (errors.categoryId) setErrors(err => ({ ...err, categoryId: undefined }));
                  }}
                  className={`${inp(errors.categoryId)} appearance-none cursor-pointer pr-8`}
                >
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </FormField>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                  className="accent-slate-800"
                />
                <div>
                  <p className="text-[12px] font-medium text-slate-800">Featured product</p>
                  <p className="text-[11px] text-slate-500">Show on homepage featured section</p>
                </div>
              </label>
            </div>
          </FormCard>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-60 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-5 sm:px-7 py-4 z-10 flex items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="text-[13px] text-slate-600 hover:text-slate-800 transition-colors"
        >
          Discard
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit("Draft")}
            disabled={!!saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border border-slate-200 rounded-xl text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-60"
          >
            {saving === "draft" ? <><Spinner />Saving…</> : "Save Draft"}
          </button>
          <button
            onClick={() => handleSubmit("Active")}
            disabled={!!saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-[#0f172a] text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving === "publish" ? <><Spinner />Publishing…</> : "Publish Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Products List ──────────────────────────────────────────────────

function ProductsList({
  products,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: {
  products:  Product[];
  loading:   boolean;
  onAdd:     () => void;
  onEdit:    (p: Product) => void;
  onDelete:  (p: Product) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const [search,         setSearch]         = useState("");
  const [sortBy,         setSortBy]         = useState("custom");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [page,           setPage]           = useState(1);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Reset to page 1 whenever the filters change — adjusted during render
  // (not in an effect) per https://react.dev/learn/you-might-not-need-an-effect
  const filterKey = `${search}|${sortBy}|${filterStatus}|${filterCategory}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const out:  { id: string; name: string }[] = [];
    for (const p of products) {
      if (!seen.has(p.category.id)) {
        seen.add(p.category.id);
        out.push({ id: p.category.id, name: p.category.name });
      }
    }
    return out;
  }, [products]);

  const filtered = useMemo(() => {
    let r = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filterStatus   !== "all") r = r.filter(p => p.status      === filterStatus);
    if (filterCategory !== "all") r = r.filter(p => p.category.id === filterCategory);

    switch (sortBy) {
      case "custom":     r.sort((a, b) => a.sortOrder - b.sortOrder);          break;
      case "name-asc":   r.sort((a, b) => a.name.localeCompare(b.name));       break;
      case "name-desc":  r.sort((a, b) => b.name.localeCompare(a.name));       break;
      case "price-asc":  r.sort((a, b) => a.basePrice - b.basePrice);          break;
      case "price-desc": r.sort((a, b) => b.basePrice - a.basePrice);          break;
      case "stock-asc":  r.sort((a, b) => a.totalStock - b.totalStock);        break;
      default:           r.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return r;
  }, [products, search, sortBy, filterStatus, filterCategory]);

  // Drag-to-reorder works on the full catalog OR narrowed to one category —
  // reordering within a category only affects that category's own relative
  // order (see reorderProducts()). Search / status filters stay excluded
  // since "reorder these arbitrary search results" isn't a meaningful action.
  const reorderable  = sortBy === "custom" && !search.trim() && filterStatus === "all";
  const totalPages   = reorderable ? 1 : Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged        = reorderable ? filtered : filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilters = (filterStatus !== "all" ? 1 : 0) + (filterCategory !== "all" ? 1 : 0);
  const startIdx     = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endIdx       = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  function handleDragStart(idx: number) {
    dragIndexRef.current = idx;
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }
  function handleDrop(idx: number) {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    setDragOverIdx(null);
    if (from === null || from === idx) return;
    const reordered = [...filtered];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    onReorder(reordered.map(p => p.id));
  }

  function resetFilters() {
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterOpen(false);
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Products</h1>
          <p className="text-[12px] text-slate-600 mt-0.5">{loading ? "Loading…" : `${products.length} total products`}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#0f172a] text-white text-[12px] font-medium px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search + Sort + Filter row */}
      <div className="relative flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white transition-colors placeholder-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none text-[12px] border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-600 bg-white outline-none focus:border-slate-400 cursor-pointer transition-colors"
          >
            <option value="custom">Custom Order</option>
            <option value="newest">Newest First</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-2 text-[12px] border rounded-lg px-3 py-2 transition-colors ${
              filterOpen
                ? "bg-slate-800 text-white border-slate-800"
                : activeFilters > 0
                ? "border-slate-800 text-slate-800 bg-slate-50"
                : "border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Filters
            {activeFilters > 0 && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${filterOpen ? "bg-white text-slate-800" : "bg-slate-800 text-white"}`}>
                {activeFilters}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-[12px] font-semibold text-slate-800">Filters</span>
                <button onClick={resetFilters} className="text-[11px] text-slate-500 hover:text-slate-700 transition-colors">Reset all</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Status</p>
                  <div className="flex gap-2">
                    {["all", "Active", "Draft", "Archived"].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          filterStatus === s
                            ? "border-slate-800 bg-slate-800 text-white"
                            : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Category</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setFilterCategory("all")}
                      className={`w-full text-left text-[12px] px-3 py-1.5 rounded-lg transition-all ${filterCategory === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      All Categories
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setFilterCategory(c.id)}
                        className={`w-full text-left text-[12px] px-3 py-1.5 rounded-lg transition-all ${
                          filterCategory === c.id ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full text-[12px] font-medium bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {reorderable && (
        <p className="text-[12px] text-slate-500 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
          {filterCategory === "all"
            ? "Drag rows to set the order products appear in on the website."
            : `Drag rows to set the order within "${categories.find(c => c.id === filterCategory)?.name ?? "this category"}" — other categories are unaffected.`}
        </p>
      )}

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700 mb-1">
              {search ? "No products found" : "No products yet"}
            </p>
            <p className="text-[12px] text-slate-500 max-w-xs">
              {search
                ? `No results for "${search}". Try adjusting your search or filters.`
                : "Get started by adding your first product."}
            </p>
            {!search && (
              <button
                onClick={onAdd}
                className="mt-4 text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                + Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {reorderable && <th className="w-8 px-2 py-3" />}
                  {["Product", "SKU", "Category", "Price", "Stock", "Wishlisted", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((product, i) => (
                  <tr
                    key={product.id}
                    draggable={reorderable}
                    onDragStart={reorderable ? () => handleDragStart(i) : undefined}
                    onDragOver={reorderable ? (e) => handleDragOver(e, i) : undefined}
                    onDragLeave={reorderable ? () => setDragOverIdx(null) : undefined}
                    onDrop={reorderable ? () => handleDrop(i) : undefined}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors duration-100 ${i === paged.length - 1 ? "border-0" : ""} ${
                      reorderable && dragOverIdx === i ? "bg-slate-100" : ""
                    }`}
                  >
                    {reorderable && (
                      <td className="px-2 py-3.5 cursor-grab active:cursor-grabbing text-slate-400" aria-label="Drag to reorder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                        </svg>
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <ProductThumb src={product.image?.url} />
                        <span className="text-[12px] font-medium text-slate-800 whitespace-nowrap">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500 font-mono whitespace-nowrap">{product.sku}</td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600 whitespace-nowrap max-w-[150px] truncate">{product.category.name}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {product.salePrice ? (
                        <div>
                          <p className="text-[12px] font-medium text-slate-800">{fp(product.salePrice)}</p>
                          <p className="text-[11px] text-slate-500 line-through">{fp(product.basePrice)}</p>
                        </div>
                      ) : (
                        <span className="text-[12px] font-medium text-slate-800">{fp(product.basePrice)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StockCell stock={product.totalStock} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill={product.wishlistCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 ${product.wishlistCount > 0 ? "text-red-400" : "text-slate-300"}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        <span className="text-[12px] font-medium">{product.wishlistCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={product.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {/* View on website */}
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={product.status === "Active" ? "View on website" : `Product is ${product.status}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          aria-label="View on website"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                          aria-label="Edit product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Delete product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-[12px] text-slate-600">
              Showing {startIdx}–{endIdx} of {filtered.length} products
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-[12px] rounded-lg transition-all ${
                    p === page ? "bg-slate-800 text-white font-medium" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >{p}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Products Section (main) ────────────────────────────────────────

export default function ProductsSection() {
  const [view,          setView]          = useState<ProductsView>("list");
  const [editProduct,   setEditProduct]   = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [products,      setProducts]      = useState<Product[]>([]);
  const [categories,    setCategories]    = useState<CategoryOption[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [successMsg,    setSuccessMsg]    = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/products?showAll=true&limit=100&sort=newest");
      const json = await res.json();
      if (json.success) setProducts(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetch("/api/categories?showAll=true")
      .then(r => r.json())
      .then(json => { if (json.success) setCategories(json.data ?? []); })
      .catch(() => {});
  }, [fetchProducts]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  async function handleSave(data: FormData) {
    const sizes  = data.sizes.length  > 0 ? data.sizes  : ["M"];
    const colors = data.colors.length > 0 ? data.colors : ["Default"];
    const price  = parseFloat(data.price);
    const sp     = data.salePrice ? parseFloat(data.salePrice) : null;

    const variants = sizes.flatMap(size => {
      const sizeStock = Math.max(0, parseInt(data.sizeQuantities[size] || "0", 10) || 0);
      return colors.map(color => ({ size, color, stock: sizeStock, price, salePrice: sp }));
    });

    const body: Record<string, unknown> = {
      name:        data.name.trim(),
      sku:         data.sku.trim().toUpperCase(),
      categoryId:  data.categoryId,
      description: data.description.trim() || null,
      tab1Title:   data.tab1Title.trim()   || null,
      tab1Content: data.tab1Content.trim() || null,
      basePrice:   price,
      salePrice:   sp,
      status:      data.status,
      isFeatured:  data.isFeatured,
      variants,
    };

    if (view === "add") {
      // New products start with no images; uploads happen in the image editor after creation
      body.images = [];
      const res  = await fetch("/api/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create product");
      const newProduct = json.data as Product;
      await fetchProducts();
      setEditProduct(newProduct);
      setView("edit");
      showSuccess(`"${data.name}" created. Upload product images below.`);
      return;
    } else if (view === "edit" && editProduct) {
      const res  = await fetch(`/api/products/${editProduct.slug}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update product");
      const updated = json.data as Product;
      // Stay on edit page; refresh list silently + update editProduct with new slug/data
      setEditProduct(updated);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showSuccess(`"${data.name}" has been saved.`);
      return;
    }

    await fetchProducts();
    setView("list");
    setEditProduct(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteProduct) return;
    const res  = await fetch(`/api/products/${deleteProduct.slug}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to delete product");
    showSuccess(`"${deleteProduct.name}" has been deleted.`);
    setDeleteProduct(null);
    await fetchProducts();
  }

  async function handleReorder(orderedIds: string[]) {
    const prev = products;
    // Optimistic update — apply the new order locally right away
    const byId = new Map(products.map(p => [p.id, p]));
    const reordered = orderedIds
      .map((id, idx) => {
        const p = byId.get(id);
        return p ? { ...p, sortOrder: idx } : null;
      })
      .filter((p): p is Product => p !== null);
    setProducts(reordered);

    try {
      const res  = await fetch("/api/admin/products/reorder", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ order: orderedIds }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
    } catch {
      setProducts(prev);
    }
  }

  return (
    <div>
      {/* Success banner */}
      {successMsg && (
        <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-[13px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-500 shrink-0">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {view === "list" && (
        <ProductsList
          products={products}
          loading={loading}
          onAdd={() => setView("add")}
          onEdit={p => { setEditProduct(p); setView("edit"); }}
          onDelete={setDeleteProduct}
          onReorder={handleReorder}
        />
      )}

      {(view === "add" || view === "edit") && (
        <ProductForm
          key={view === "edit" ? (editProduct?.id ?? "edit") : "add"}
          product={view === "edit" ? editProduct ?? undefined : undefined}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setView("list"); setEditProduct(null); }}
        />
      )}

      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onCancel={() => setDeleteProduct(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
