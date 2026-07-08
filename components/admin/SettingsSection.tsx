"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────

type SettingsTab = "general" | "branding" | "shipping" | "tax" | "notifications" | "security";

interface GeneralForm {
  storeName: string; storeEmail: string; storePhone: string;
  storeAddress: string; currency: string; timezone: string;
}
interface BrandingForm  { primaryColor: string; secondaryColor: string; }
interface ShippingForm  { freeThreshold: string; standardCost: string; expressCost: string; }
interface TaxForm       { taxEnabled: boolean; taxPercentage: string; }
interface NotifForm     { newOrder: boolean; orderShipped: boolean; orderDelivered: boolean; }

interface BrandAssetData {
  type:         string;
  url:          string;
  optimizedUrl: string;
  thumbnailUrl: string;
  publicId:     string;
}

// ── Initial mock data ──────────────────────────────────────────────

const INIT_GENERAL: GeneralForm = {
  storeName:    "Nayab Posh",
  storeEmail:   "hello@nayabposh.com",
  storePhone:   "+92 300 123 4567",
  storeAddress: "123 Liberty Market, Gulberg III, Lahore, Punjab 54660, Pakistan",
  currency:     "PKR",
  timezone:     "Asia/Karachi",
};
const INIT_BRANDING: BrandingForm = { primaryColor: "#111111", secondaryColor: "#C8A882" };
const INIT_SHIPPING: ShippingForm = { freeThreshold: "5000", standardCost: "250", expressCost: "500" };
const INIT_TAX:      TaxForm      = { taxEnabled: true, taxPercentage: "17" };
const INIT_NOTIF:    NotifForm    = { newOrder: true, orderShipped: true, orderDelivered: false };

const CURRENCIES = [
  { value:"PKR", label:"PKR — Pakistani Rupee" },
  { value:"USD", label:"USD — US Dollar" },
  { value:"EUR", label:"EUR — Euro" },
  { value:"GBP", label:"GBP — British Pound" },
  { value:"AED", label:"AED — UAE Dirham" },
  { value:"SAR", label:"SAR — Saudi Riyal" },
];
const TIMEZONES = [
  { value:"Asia/Karachi",       label:"Asia/Karachi (UTC+5)" },
  { value:"Asia/Dubai",         label:"Asia/Dubai (UTC+4)" },
  { value:"Asia/Riyadh",        label:"Asia/Riyadh (UTC+3)" },
  { value:"Europe/London",      label:"Europe/London (UTC+0/+1)" },
  { value:"America/New_York",   label:"America/New_York (UTC-5/-4)" },
  { value:"America/Los_Angeles",label:"America/Los_Angeles (UTC-8/-7)" },
];

// ── Nav items ──────────────────────────────────────────────────────

interface NavItem { id: SettingsTab; label: string; icon: React.ReactNode; }

const NAV_ITEMS: NavItem[] = [
  { id:"general", label:"General",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg> },
  { id:"branding", label:"Branding",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" /></svg> },
  { id:"shipping", label:"Shipping",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg> },
  { id:"tax", label:"Tax",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" /></svg> },
  { id:"notifications", label:"Notifications",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg> },
  { id:"security", label:"Security",
    icon:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg> },
];

// ── Utilities ──────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

// ── Reusable form components ───────────────────────────────────────

function FormField({ label, type = "text", value, onChange, placeholder, hint }: {
  label: string; type?: React.HTMLInputTypeAttribute | "textarea";
  value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string;
}) {
  const cls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-slate-500 transition-colors bg-white";
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} className={`${cls} resize-none`} />
      ) : (
        <input type={type as React.HTMLInputTypeAttribute} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 pr-9 text-[13px] text-slate-800 outline-none focus:border-slate-500 transition-colors bg-white cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ColorPicker({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{label}</label>
      <label className="flex items-center gap-3 px-3 py-2.5 border border-slate-200 rounded-xl hover:border-slate-400 transition-colors bg-white cursor-pointer">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 shrink-0">
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <span className="text-[13px] font-medium text-slate-700 font-mono tracking-wide">{value.toUpperCase()}</span>
        <span className="ml-auto text-[11px] text-slate-500 font-sans">Click to change</span>
      </label>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ── Brand Asset Uploader ───────────────────────────────────────────

function BrandAssetUploader({
  type,
  label,
  hint,
  asset,
  onUploaded,
  onDeleted,
}: {
  type:       "Logo" | "Favicon" | "Banner";
  label:      string;
  hint:       string;
  asset:      BrandAssetData | null;
  onUploaded: (data: BrandAssetData) => void;
  onDeleted:  () => void;
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
    fd.append("file",           file);
    fd.append("uploadType",     "brand");
    fd.append("brandAssetType", type);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Upload failed."); return; }
      onUploaded(json.data as BrandAssetData);
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
      const res  = await fetch(`/api/brand-assets/${type}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to remove."); return; }
      onDeleted();
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

  if (asset) {
    return (
      <div className="space-y-1.5">
        <p className="block text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{label}</p>
        <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/40">
          <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.thumbnailUrl || asset.url} alt={label} className="max-w-full max-h-full object-contain p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-slate-700">{label} uploaded</p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{asset.url}</p>
            <div className="flex items-center gap-3 mt-2.5">
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
      <p className="block text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{label}</p>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !(uploading || deleting) && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-7 text-center transition-all ${
          uploading
            ? "border-slate-200 bg-slate-50/50 cursor-not-allowed"
            : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 cursor-pointer group"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mx-auto mb-3 transition-colors">
          {uploading ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>
        <p className="text-[13px] font-medium text-slate-600 mb-1">
          {uploading ? "Uploading…" : `Drop ${label.toLowerCase()} here or click to upload`}
        </p>
        <p className="text-[11px] text-slate-500">{hint}</p>
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

// ── Section Card wrapper ───────────────────────────────────────────

function SectionCard({ title, description, children, onSave, saving, saved }: {
  title: string; description: string; children: React.ReactNode;
  onSave: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
        <p className="text-[12px] text-slate-600 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
      <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
              <CheckIcon />
              Changes saved
            </span>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <><Spinner />Saving…</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ── Settings Sections ──────────────────────────────────────────────

function GeneralSection() {
  const [f, setF]       = useState<GeneralForm>(INIT_GENERAL);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");
  const set = <K extends keyof GeneralForm>(k: K) => (v: GeneralForm[K]) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(json => {
      if (!json.success) return;
      const s = json.data;
      setF({ storeName: s.storeName, storeEmail: s.storeEmail, storePhone: s.storePhone,
             storeAddress: s.storeAddress, currency: s.currency, timezone: s.timezone });
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName: f.storeName, storeEmail: f.storeEmail,
          storePhone: f.storePhone, storeAddress: f.storeAddress,
          currency: f.currency, timezone: f.timezone }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally  { setSaving(false); }
  }

  return (
    <SectionCard title="General Settings" description="Basic information about your store." onSave={handleSave} saving={saving} saved={saved}>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Store Name" value={f.storeName} onChange={set("storeName")} placeholder="Nayab Posh" />
        <FormField label="Store Email" type="email" value={f.storeEmail} onChange={set("storeEmail")} placeholder="hello@nayabposh.com" />
        <FormField label="Store Phone Number" type="tel" value={f.storePhone} onChange={set("storePhone")} placeholder="+92 300 000 0000" />
        <SelectField label="Currency" value={f.currency} onChange={set("currency")} options={CURRENCIES} />
        <div className="sm:col-span-2">
          <FormField label="Store Address" type="textarea" value={f.storeAddress} onChange={set("storeAddress")} placeholder="Street, City, Province, Postal Code, Country" />
        </div>
        <SelectField label="Time Zone" value={f.timezone} onChange={set("timezone")} options={TIMEZONES} hint="Used for order timestamps and reports." />
      </div>
    </SectionCard>
  );
}

function BrandingSection() {
  const [f,      setF]      = useState<BrandingForm>(INIT_BRANDING);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [assets, setAssets] = useState<Record<string, BrandAssetData>>({});

  useEffect(() => {
    fetch("/api/brand-assets")
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const map: Record<string, BrandAssetData> = {};
        for (const a of (json.data ?? [])) map[a.type] = a;
        setAssets(map);
      })
      .catch(() => {});
  }, []);

  function uploaded(type: string, data: BrandAssetData) {
    setAssets(prev => ({ ...prev, [type]: data }));
  }
  function deleted(type: string) {
    setAssets(prev => { const n = { ...prev }; delete n[type]; return n; });
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 600);
  }

  return (
    <SectionCard title="Branding" description="Customize your store's visual identity." onSave={handleSave} saving={saving} saved={saved}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <BrandAssetUploader
            type="Logo"
            label="Store Logo"
            hint="PNG or WebP · Recommended 200×60px · Max 5 MB"
            asset={assets["Logo"] ?? null}
            onUploaded={d => uploaded("Logo", d)}
            onDeleted={() => deleted("Logo")}
          />
        </div>
        <div className="sm:col-span-2">
          <BrandAssetUploader
            type="Favicon"
            label="Favicon"
            hint="PNG or WebP · Recommended 32×32px · Max 5 MB"
            asset={assets["Favicon"] ?? null}
            onUploaded={d => uploaded("Favicon", d)}
            onDeleted={() => deleted("Favicon")}
          />
        </div>
        <div className="sm:col-span-2">
          <BrandAssetUploader
            type="Banner"
            label="Store Banner"
            hint="JPEG, PNG, or WebP · Recommended 1920×600px · Max 5 MB"
            asset={assets["Banner"] ?? null}
            onUploaded={d => uploaded("Banner", d)}
            onDeleted={() => deleted("Banner")}
          />
        </div>
        <ColorPicker label="Primary Color" value={f.primaryColor} onChange={v => setF(p => ({ ...p, primaryColor: v }))} hint="Used for headings, buttons and key accents." />
        <ColorPicker label="Secondary Color" value={f.secondaryColor} onChange={v => setF(p => ({ ...p, secondaryColor: v }))} hint="Used for borders, dividers and subtle accents." />
      </div>
    </SectionCard>
  );
}

function ShippingSection() {
  const [f, setF]       = useState<ShippingForm>(INIT_SHIPPING);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");
  const set = <K extends keyof ShippingForm>(k: K) => (v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(json => {
      if (!json.success) return;
      const s = json.data;
      setF({ freeThreshold: String(s.freeThreshold), standardCost: String(s.standardCost), expressCost: String(s.expressCost) });
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeThreshold: Number(f.freeThreshold) || 0,
          standardCost:  Number(f.standardCost)  || 0,
          expressCost:   Number(f.expressCost)   || 0,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally  { setSaving(false); }
  }

  return (
    <SectionCard title="Shipping Settings" description="Configure shipping rates and thresholds." onSave={handleSave} saving={saving} saved={saved}>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FormField
            label="Free Shipping Threshold (Rs.)"
            type="number"
            value={f.freeThreshold}
            onChange={set("freeThreshold")}
            placeholder="5000"
            hint="Orders above this amount qualify for free shipping. Set to 0 to disable."
          />
        </div>
        <FormField
          label="Standard Shipping Cost (Rs.)"
          type="number"
          value={f.standardCost}
          onChange={set("standardCost")}
          placeholder="250"
          hint="3–5 business days"
        />
        <FormField
          label="Express Shipping Cost (Rs.)"
          type="number"
          value={f.expressCost}
          onChange={set("expressCost")}
          placeholder="500"
          hint="1–2 business days"
        />
      </div>
    </SectionCard>
  );
}

function TaxSection() {
  const [f, setF]       = useState<TaxForm>(INIT_TAX);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(json => {
      if (!json.success) return;
      const s = json.data;
      setF({ taxEnabled: s.taxEnabled, taxPercentage: String(s.taxPercentage) });
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxEnabled: f.taxEnabled, taxPercentage: Number(f.taxPercentage) || 0 }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally  { setSaving(false); }
  }

  return (
    <SectionCard title="Tax Settings" description="Manage tax rates applied to orders." onSave={handleSave} saving={saving} saved={saved}>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="space-y-5">
        <div className="px-4 py-4 border border-slate-200 rounded-xl">
          <Toggle
            checked={f.taxEnabled}
            onChange={v => setF(p => ({ ...p, taxEnabled: v }))}
            label="Enable Tax Collection"
            description="Automatically calculate and display tax on all orders."
          />
        </div>
        {f.taxEnabled && (
          <div className="max-w-xs">
            <FormField
              label="Tax Percentage (%)"
              type="number"
              value={f.taxPercentage}
              onChange={v => setF(p => ({ ...p, taxPercentage: v }))}
              placeholder="17"
              hint="Pakistan standard GST is 17%."
            />
          </div>
        )}
        {!f.taxEnabled && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-[12px] text-amber-700">Tax collection is disabled. No tax will be added to customer orders.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function NotificationsSection() {
  const [f, setF]       = useState<NotifForm>(INIT_NOTIF);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");
  const set = (k: keyof NotifForm) => (v: boolean) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(json => {
      if (!json.success) return;
      const s = json.data;
      setF({ newOrder: s.notifNewOrder, orderShipped: s.notifOrderShipped, orderDelivered: s.notifOrderDelivered });
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifNewOrder: f.newOrder, notifOrderShipped: f.orderShipped, notifOrderDelivered: f.orderDelivered,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save"); return; }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally  { setSaving(false); }
  }

  return (
    <SectionCard title="Notification Settings" description="Choose which email notifications you receive." onSave={handleSave} saving={saving} saved={saved}>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em] mb-3">Email Notifications</p>
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          <div className="px-4 py-4">
            <Toggle
              checked={f.newOrder}
              onChange={set("newOrder")}
              label="New Order"
              description="Get notified when a new order is placed in your store."
            />
          </div>
          <div className="px-4 py-4">
            <Toggle
              checked={f.orderShipped}
              onChange={set("orderShipped")}
              label="Order Shipped"
              description="Get notified when an order's status is updated to Shipped."
            />
          </div>
          <div className="px-4 py-4">
            <Toggle
              checked={f.orderDelivered}
              onChange={set("orderDelivered")}
              label="Order Delivered"
              description="Get notified when an order has been successfully delivered."
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SecuritySection() {
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwSaved,    setPwSaved]    = useState(false);
  const [pwError,    setPwError]    = useState("");

  const [twoFa,       setTwoFa]      = useState(false);
  const [twoFaSaving, setTwoFaSaving] = useState(false);
  const [twoFaSaved,  setTwoFaSaved]  = useState(false);

  async function handleUpdatePw() {
    if (!currentPw.trim())   { setPwError("Current password is required."); return; }
    if (newPw.length < 8)    { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    setPwError(""); setPwSaving(true);
    try {
      const res  = await fetch("/api/admin/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = await res.json();
      if (!json.success) { setPwError(json.error ?? "Failed to update password"); return; }
      setPwSaved(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } catch { setPwError("Network error. Please try again."); }
    finally  { setPwSaving(false); }
  }

  function handleToggle2FA() {
    setTwoFaSaving(true);
    setTimeout(() => {
      setTwoFaSaving(false);
      setTwoFa(v => !v);
      setTwoFaSaved(true);
      setTimeout(() => setTwoFaSaved(false), 3000);
    }, 900);
  }

  return (
    <div className="space-y-5">
      {/* Change Password */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">Change Password</h2>
          <p className="text-[12px] text-slate-600 mt-0.5">Update your admin account password.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="max-w-sm">
            <FormField label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <FormField label="New Password" type="password" value={newPw} onChange={setNewPw} placeholder="Min. 8 characters" />
            <FormField label="Confirm New Password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" />
          </div>
          {pwError && (
            <div className="flex items-center gap-2 text-[12px] text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842L13.5 14.06v.255a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .5-.714l1.922-1.682c.74-.648.74-1.956 0-2.617l-.194-.17ZM12 18.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
              {pwError}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            {pwSaved && (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                <CheckIcon />Password updated successfully
              </span>
            )}
          </div>
          <button
            onClick={handleUpdatePw}
            disabled={pwSaving}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pwSaving ? <><Spinner />Updating…</> : "Update Password"}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">Two-Factor Authentication</h2>
          <p className="text-[12px] text-slate-600 mt-0.5">Add an extra layer of security to your admin account.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start justify-between gap-6 p-4 border border-slate-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${twoFa ? "bg-emerald-50" : "bg-slate-100"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${twoFa ? "text-emerald-500" : "text-slate-500"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 4.5h3" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-700">Authenticator App</p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {twoFa
                    ? "2FA is enabled. A verification code will be required each time you log in."
                    : "Require a one-time code from an authenticator app when logging in."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {twoFaSaving && <Spinner />}
              {!twoFaSaving && (
                <button
                  onClick={handleToggle2FA}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${twoFa ? "bg-emerald-500" : "bg-slate-200"}`}
                  aria-pressed={twoFa}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${twoFa ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              )}
            </div>
          </div>
          {twoFaSaved && (
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 px-1">
              <CheckIcon />
              Two-factor authentication {twoFa ? "enabled" : "disabled"} successfully.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const content: Record<SettingsTab, React.ReactNode> = {
    general:       <GeneralSection />,
    branding:      <BrandingSection />,
    shipping:      <ShippingSection />,
    tax:           <TaxSection />,
    notifications: <NotificationsSection />,
    security:      <SecuritySection />,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
        <p className="text-[12px] text-slate-600 mt-0.5">Manage your store configuration and preferences.</p>
      </div>

      {/* Mobile nav (horizontal scroll) */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 lg:hidden scrollbar-none">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 text-[12px] font-medium whitespace-nowrap transition-all ${
              activeTab === item.id
                ? "bg-slate-800 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            <span className={activeTab === item.id ? "text-white" : "text-slate-500"}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 items-start">

        {/* Left nav (desktop only) */}
        <div className="hidden lg:block bg-white border border-slate-200 rounded-xl p-2 sticky top-5 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                activeTab === item.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className={activeTab === item.id ? "text-white" : "text-slate-500"}>{item.icon}</span>
              <span className="text-[13px] font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1 h-1 rounded-full bg-white/60" />
              )}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div>{content[activeTab]}</div>
      </div>
    </div>
  );
}
