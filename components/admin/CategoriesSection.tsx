"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface Category {
  id:            string;
  name:          string;
  slug:          string;
  description?:  string | null;
  imageUrl?:     string | null;
  parentId?:     string | null;
  parent?:       { id: string; name: string; slug: string } | null;
  sortOrder:     number;
  productCount:  number;
  childrenCount: number;
  isActive:      boolean;
  createdAt:     string;
  updatedAt:     string;
}

type CategoriesView = "list" | "add" | "edit";

interface FormData {
  name:        string;
  slug:        string;
  description: string;
  parentId:    string;
  isActive:    boolean;
}

type FormErrors = Partial<Record<keyof FormData | "general", string>>;

// ── Constants ──────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

const THUMB_COLORS = [
  "bg-gradient-to-br from-rose-100 to-rose-200",
  "bg-gradient-to-br from-violet-100 to-violet-200",
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-emerald-100 to-emerald-200",
  "bg-gradient-to-br from-amber-100 to-amber-200",
  "bg-gradient-to-br from-pink-100 to-pink-200",
  "bg-gradient-to-br from-indigo-100 to-indigo-200",
  "bg-gradient-to-br from-teal-100 to-teal-200",
];

const THUMB_TEXT = [
  "text-rose-600",
  "text-violet-600",
  "text-blue-600",
  "text-emerald-600",
  "text-amber-600",
  "text-pink-600",
  "text-indigo-600",
  "text-teal-600",
];

// ── Utilities ──────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function thumbIdx(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return hash % THUMB_COLORS.length;
}

// ── Micro components ───────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-block text-[10px] tracking-[0.08em] uppercase font-medium px-2 py-0.5 rounded-full ${
      isActive
        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
    }`}>{isActive ? "Active" : "Hidden"}</span>
  );
}

function CategoryThumb({ id, name, imageUrl }: { id: string; name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  const i = thumbIdx(id);
  return (
    <div className={`w-10 h-10 rounded-lg ${THUMB_COLORS[i]} flex items-center justify-center shrink-0`}>
      <span className={`text-[14px] font-bold ${THUMB_TEXT[i]}`}>{name[0]?.toUpperCase() ?? "C"}</span>
    </div>
  );
}

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

function FormField({ label, error, required, hint, children }: { label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-slate-700 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ── Category Image Uploader ────────────────────────────────────────

function CategoryImageUploader({
  categorySlug,
  currentImageUrl,
  onUpload,
  onDelete,
}: {
  categorySlug:    string;
  currentImageUrl: string | null;
  onUpload:        (url: string) => void;
  onDelete:        () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (uploading || deleting) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file",         file);
    fd.append("uploadType",   "category");
    fd.append("categorySlug", categorySlug);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Upload failed."); return; }
      onUpload(json.data.url as string);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res  = await fetch("/api/upload", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ uploadType: "category", categorySlug }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to remove."); return; }
      onDelete();
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (currentImageUrl) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50/40">
          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImageUrl} alt="Category" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-slate-700">Category image uploaded</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || deleting}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? "Uploading…" : "Replace"}
              </button>
              <span className="text-slate-400 select-none">|</span>
              <button
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="text-[11px] font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
            {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !(uploading || deleting) && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          uploading
            ? "border-slate-200 bg-slate-50/50 cursor-not-allowed"
            : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 cursor-pointer group"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mx-auto mb-2.5 transition-colors">
          {uploading ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>
        <p className="text-[12px] font-medium text-slate-600 mb-1">
          {uploading ? "Uploading…" : "Drop image here or click to upload"}
        </p>
        <p className="text-[11px] text-slate-500">JPEG, PNG, WebP · Max 5 MB</p>
        {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────

function DeleteModal({
  category,
  onCancel,
  onConfirm,
}: {
  category:  Category;
  onCancel:  () => void;
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
          <h3 className="text-[15px] font-semibold text-slate-800 mb-2">Delete Category</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-700">&ldquo;{category.name}&rdquo;</span>?{" "}
            {category.productCount > 0 && (
              <span className="text-amber-600">
                This category contains {category.productCount} product{category.productCount !== 1 ? "s" : ""}.{" "}
              </span>
            )}
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
            {deleting ? <><Spinner />Deleting…</> : "Delete Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Form (Add / Edit) ─────────────────────────────────────

function CategoryForm({
  category,
  allCategories,
  onSave,
  onCancel,
}: {
  category?:     Category;
  allCategories: Category[];
  onSave:        (data: FormData) => Promise<void>;
  onCancel:      () => void;
}) {
  const isEdit = !!category;

  const [form, setForm] = useState<FormData>({
    name:        category?.name        ?? "",
    slug:        category?.slug        ?? "",
    description: category?.description ?? "",
    parentId:    category?.parentId    ?? "",
    isActive:    category?.isActive    ?? true,
  });

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(category?.imageUrl ?? null);
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [saving,     setSaving]     = useState<"hidden" | "publish" | null>(null);

  useEffect(() => {
    if (!slugEdited && form.name) {
      setForm(f => ({ ...f, slug: generateSlug(f.name) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim())                              errs.name = "Category name is required";
    else if (form.name.trim().length < 2)               errs.name = "Name must be at least 2 characters";
    if (!form.slug.trim())                              errs.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(form.slug))          errs.slug = "Slug may only contain lowercase letters, numbers and hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(isActive: boolean) {
    if (!validate()) return;
    setSaving(isActive ? "publish" : "hidden");
    try {
      await onSave({ ...form, isActive });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save category";
      setErrors(prev => ({ ...prev, general: msg }));
      setSaving(null);
    }
  }

  function setName(name: string) {
    setForm(f => ({ ...f, name, slug: slugEdited ? f.slug : generateSlug(name) }));
    if (errors.name) setErrors(e => ({ ...e, name: undefined }));
  }

  function setSlug(slug: string) {
    setSlugEdited(true);
    setForm(f => ({ ...f, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") }));
    if (errors.slug) setErrors(e => ({ ...e, slug: undefined }));
  }

  const inp = (err?: string) =>
    `w-full border ${err ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400"} rounded-lg px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 bg-white outline-none transition-colors`;

  const parentOptions = allCategories.filter(c => c.id !== category?.id);

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Categories
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[12px] text-slate-700 font-medium">
          {isEdit ? form.name || "Edit Category" : "Add Category"}
        </span>
      </div>

      <h1 className="text-xl font-semibold text-slate-800 mb-6">
        {isEdit ? "Edit Category" : "Add Category"}
      </h1>

      {errors.general && (
        <div className="mb-5 border border-red-200 bg-red-50 text-red-600 text-[12px] px-4 py-3 rounded-xl">
          {errors.general}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Category Details */}
          <FormCard title="Category Details">
            <div className="space-y-4">
              <FormField label="Category Name" error={errors.name} required>
                <input
                  value={form.name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Festive Collection"
                  className={inp(errors.name)}
                />
              </FormField>

              <FormField
                label="Slug"
                error={errors.slug}
                required
                hint={slugEdited ? undefined : "Auto-generated from name — click to edit"}
              >
                <div className="relative">
                  <input
                    value={form.slug}
                    onChange={e => setSlug(e.target.value)}
                    onFocus={() => setSlugEdited(true)}
                    placeholder="e.g. festive-collection"
                    className={`${inp(errors.slug)} pr-16 font-mono`}
                  />
                  {!slugEdited && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Auto
                    </span>
                  )}
                </div>
              </FormField>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this category…"
                  rows={4}
                  className={`${inp()} resize-none`}
                />
              </FormField>
            </div>
          </FormCard>

          {/* Category Image (edit mode only) */}
          {isEdit && category && (
            <FormCard title="Category Image">
              <CategoryImageUploader
                categorySlug={category.slug}
                currentImageUrl={currentImageUrl}
                onUpload={url => setCurrentImageUrl(url)}
                onDelete={() => setCurrentImageUrl(null)}
              />
            </FormCard>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Visibility */}
          <FormCard title="Visibility">
            <div className="space-y-2">
              {([true, false] as const).map((active) => (
                <label
                  key={String(active)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all ${
                    form.isActive === active ? "border-slate-800 bg-slate-50" : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    checked={form.isActive === active}
                    onChange={() => setForm(f => ({ ...f, isActive: active }))}
                    className="accent-slate-800"
                  />
                  <div>
                    <p className="text-[12px] font-medium text-slate-800">{active ? "Active" : "Hidden"}</p>
                    <p className="text-[11px] text-slate-500">
                      {active ? "Visible to customers" : "Hidden from store"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </FormCard>

          {/* Parent Category */}
          <FormCard title="Organization">
            <FormField label="Parent Category">
              <div className="relative">
                <select
                  value={form.parentId}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  className={`${inp()} appearance-none cursor-pointer pr-8`}
                >
                  <option value="">None (Top-level)</option>
                  {parentOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Leave empty to create a top-level category</p>
            </FormField>
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
            onClick={() => handleSubmit(false)}
            disabled={!!saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border border-slate-200 rounded-xl text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-60"
          >
            {saving === "hidden" ? <><Spinner />Saving…</> : "Save as Hidden"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={!!saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-[#0f172a] text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving === "publish" ? <><Spinner />Publishing…</> : "Publish Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Categories List ────────────────────────────────────────────────

function CategoriesList({
  categories,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: {
  categories: Category[];
  loading:    boolean;
  onAdd:      () => void;
  onEdit:     (c: Category) => void;
  onDelete:   (c: Category) => void;
  onReorder:  (orderedIds: string[]) => void;
}) {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("custom");
  const [page,    setPage]    = useState(1);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Reset to page 1 whenever the filters change — adjusted during render
  // (not in an effect) per https://react.dev/learn/you-might-not-need-an-effect
  const filterKey = `${search}|${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const filtered = useMemo(() => {
    let r = [...categories];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "custom":    r.sort((a, b) => a.sortOrder - b.sortOrder);            break;
      case "name-asc":  r.sort((a, b) => a.name.localeCompare(b.name));         break;
      case "name-desc": r.sort((a, b) => b.name.localeCompare(a.name));         break;
      case "most":      r.sort((a, b) => b.productCount - a.productCount);      break;
      case "fewest":    r.sort((a, b) => a.productCount - b.productCount);      break;
      default:          r.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    }
    return r;
  }, [categories, search, sortBy]);

  // Drag-to-reorder is only meaningful on the full, unfiltered custom-order view
  const reorderable = sortBy === "custom" && !search.trim();
  const totalPages  = reorderable ? 1 : Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged       = reorderable ? filtered : filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const startIdx    = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endIdx      = Math.min(page * ITEMS_PER_PAGE, filtered.length);

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
    onReorder(reordered.map(c => c.id));
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Categories</h1>
          <p className="text-[12px] text-slate-600 mt-0.5">{loading ? "Loading…" : `${categories.length} total categories`}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#0f172a] text-white text-[12px] font-medium px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories…"
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
            <option value="most">Products: Most</option>
            <option value="fewest">Products: Fewest</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {reorderable && (
        <p className="text-[12px] text-slate-500 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
          Drag rows to set the order categories appear on the homepage.
        </p>
      )}

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-14 w-full" />)}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700 mb-1">
              {search ? "No categories found" : "No categories yet"}
            </p>
            <p className="text-[12px] text-slate-500 max-w-xs">
              {search ? `No results for "${search}".` : "Create your first category to organise your products."}
            </p>
            {!search && (
              <button
                onClick={onAdd}
                className="mt-4 text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                + Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {reorderable && <th className="w-8 px-2 py-3" />}
                  {["Category", "Products", "Status", "Created", "Actions"].map(h => (
                    <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((cat, i) => (
                  <tr
                    key={cat.id}
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
                      <td className="px-2 py-4 cursor-grab active:cursor-grabbing text-slate-400" aria-label="Drag to reorder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                        </svg>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <CategoryThumb id={cat.id} name={cat.name} imageUrl={cat.imageUrl} />
                        <div>
                          <p className="text-[12px] font-medium text-slate-800">{cat.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">/{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[12px] font-medium ${cat.productCount > 0 ? "text-slate-700" : "text-slate-500"}`}>
                        {cat.productCount > 0 ? `${cat.productCount} product${cat.productCount !== 1 ? "s" : ""}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge isActive={cat.isActive} /></td>
                    <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                      {new Date(cat.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(cat)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                          aria-label="Edit category"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(cat)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Delete category"
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
              Showing {startIdx}–{endIdx} of {filtered.length} categories
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

// ── Categories Section (main) ──────────────────────────────────────

export default function CategoriesSection() {
  const [view,           setView]           = useState<CategoriesView>("list");
  const [editCategory,   setEditCategory]   = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [categories,     setCategories]     = useState<Category[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [successMsg,     setSuccessMsg]     = useState("");

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setLoading(true);
    try {
      const res  = await fetch("/api/categories?showAll=true");
      const json = await res.json();
      const data: Category[] = json.success ? (json.data ?? []) : [];
      setCategories(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  async function handleSave(data: FormData) {
    const body = {
      name:        data.name.trim(),
      slug:        data.slug.trim() || null,
      description: data.description.trim() || null,
      parentId:    data.parentId || null,
      isActive:    data.isActive,
    };

    if (view === "add") {
      const res  = await fetch("/api/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create category");
      const createdSlug = json.data?.slug as string | undefined;
      const fresh = await fetchCategories();
      const found = createdSlug ? fresh.find(c => c.slug === createdSlug) : undefined;
      if (found) {
        setEditCategory(found);
        setView("edit");
        showSuccess(`"${data.name}" created. Upload a category image below.`);
      } else {
        showSuccess(`"${data.name}" has been added successfully.`);
        setView("list");
        setEditCategory(null);
      }
      return;
    } else if (view === "edit" && editCategory) {
      const res  = await fetch(`/api/categories/${editCategory.slug}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update category");
      showSuccess(`"${data.name}" has been updated.`);
    }

    await fetchCategories();
    setView("list");
    setEditCategory(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteCategory) return;
    const res  = await fetch(`/api/categories/${deleteCategory.slug}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to delete category");
    showSuccess(`"${deleteCategory.name}" has been deleted.`);
    setDeleteCategory(null);
    await fetchCategories();
  }

  async function handleReorder(orderedIds: string[]) {
    const prev = categories;
    const byId = new Map(categories.map(c => [c.id, c]));
    const reordered = orderedIds
      .map((id, idx) => {
        const c = byId.get(id);
        return c ? { ...c, sortOrder: idx } : null;
      })
      .filter((c): c is Category => c !== null);
    setCategories(reordered);

    try {
      const res  = await fetch("/api/admin/categories/reorder", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ order: orderedIds }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
    } catch {
      setCategories(prev);
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
        <CategoriesList
          categories={categories}
          loading={loading}
          onAdd={() => setView("add")}
          onEdit={c => { setEditCategory(c); setView("edit"); }}
          onDelete={setDeleteCategory}
          onReorder={handleReorder}
        />
      )}

      {(view === "add" || view === "edit") && (
        <CategoryForm
          key={view === "edit" ? (editCategory?.id ?? "edit") : "add"}
          category={view === "edit" ? editCategory ?? undefined : undefined}
          allCategories={categories}
          onSave={handleSave}
          onCancel={() => { setView("list"); setEditCategory(null); }}
        />
      )}

      {deleteCategory && (
        <DeleteModal
          category={deleteCategory}
          onCancel={() => setDeleteCategory(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
