"use client";

import { useState } from "react";
import type { AddressDTO } from "@/lib/types/address";
import { Spinner, SectionTitle, EmptyState, InlineInput, SuccessBanner, ErrorBanner } from "./ui";

interface AddrForm {
  label:      string;
  fullName:   string;
  phone:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
}

const EMPTY_FORM: AddrForm = {
  label: "Home", fullName: "", phone: "", street: "",
  city: "", province: "", postalCode: "", country: "Pakistan", isDefault: false,
};

function formFromDTO(a: AddressDTO): AddrForm {
  return {
    label:      a.label ?? "Home",
    fullName:   a.fullName,
    phone:      a.phone,
    street:     a.street,
    city:       a.city,
    province:   a.province,
    postalCode: a.postalCode,
    country:    a.country,
    isDefault:  a.isDefault,
  };
}

interface Props {
  initialAddresses: AddressDTO[];
}

export default function AddressManager({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<AddressDTO[]>(initialAddresses);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState<AddrForm>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");

  function flash(msg: string, type: "success" | "error") {
    if (type === "success") { setSuccess(msg); setError(""); }
    else                    { setError(msg);   setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  }

  function setF(k: keyof AddrForm, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.fullName.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim()) {
      flash("Please fill in all required fields.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const res  = await fetch(`/api/user/addresses/${editId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to update address");
        setAddresses((prev) => prev.map((a) => a.id === editId ? data.data : a));
        setEditId(null);
        flash("Address updated.", "success");
      } else {
        const res  = await fetch("/api/user/addresses", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to add address");
        setAddresses((prev) => {
          const updated = data.data.isDefault
            ? prev.map((a) => ({ ...a, isDefault: false }))
            : prev;
          return [...updated, data.data];
        });
        setShowAdd(false);
        flash("Address added.", "success");
      }
      setForm(EMPTY_FORM);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete address");
      }
      setAddresses((prev) => {
        const remaining = prev.filter((a) => a.id !== id);
        const wasDefault = prev.find((a) => a.id === id)?.isDefault;
        if (wasDefault && remaining.length > 0) {
          return remaining.map((a, i) => i === 0 ? { ...a, isDefault: true } : a);
        }
        return remaining;
      });
      setDeleteId(null);
      flash("Address removed.", "success");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ setDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to set default");
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      flash("Default address updated.", "success");
    } catch {
      flash("Failed to set default address.", "error");
    }
  }

  function startEdit(addr: AddressDTO) {
    setEditId(addr.id);
    setForm(formFromDTO(addr));
    setShowAdd(false);
  }

  function cancelForm() {
    setShowAdd(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  const AddressForm = ({ onCancel }: { onCancel: () => void }) => (
    <div className="border border-[var(--border)] p-6 space-y-4">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--black)] font-medium mb-5">
        {editId ? "Edit Address" : "New Address"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">Label</label>
          <select
            value={form.label}
            onChange={(e) => setF("label", e.target.value)}
            className="w-full border border-[var(--border)] focus:border-[var(--black)] px-4 py-3 text-[13px] text-[var(--black)] bg-white outline-none appearance-none rounded-none"
          >
            {["Home", "Work", "Other"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <InlineInput label="Full Name *" value={form.fullName} onChange={(v) => setF("fullName", v)} placeholder="Sara Khan" />
      </div>
      <InlineInput label="Street Address *" value={form.street} onChange={(v) => setF("street", v)} placeholder="House no., street, area" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InlineInput label="City *"     value={form.city}       onChange={(v) => setF("city", v)}       placeholder="Lahore" />
        <InlineInput label="Province"   value={form.province}   onChange={(v) => setF("province", v)}   placeholder="Punjab" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InlineInput label="Postal Code" value={form.postalCode} onChange={(v) => setF("postalCode", v)} placeholder="54000" />
        <InlineInput label="Country"     value={form.country}    onChange={(v) => setF("country", v)}    placeholder="Pakistan" />
      </div>
      <InlineInput label="Phone *" value={form.phone} onChange={(v) => setF("phone", v)} placeholder="+92 300 0000000" type="tel" />
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="isDefault"
          checked={form.isDefault}
          onChange={(e) => setF("isDefault", e.target.checked)}
          className="w-3.5 h-3.5 accent-[var(--black)]"
        />
        <label htmlFor="isDefault" className="text-[11px] text-[var(--muted)] cursor-pointer">Set as default address</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
        >
          {saving ? <><Spinner /><span>Saving…</span></> : "Save Address"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-[var(--border)] text-[var(--muted)] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--black)] hover:text-[var(--accent)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <SectionTitle>Addresses</SectionTitle>
        {!showAdd && !editId && (
          <button
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase border border-[var(--black)] text-[var(--black)] px-4 py-2.5 hover:bg-[var(--black)] hover:text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Address
          </button>
        )}
      </div>

      {success && <div className="mb-5"><SuccessBanner msg={success} /></div>}
      {error   && <div className="mb-5"><ErrorBanner   msg={error}   /></div>}

      {addresses.length === 0 && !showAdd ? (
        <EmptyState
          title="No addresses saved"
          body="Add a delivery address to speed up future checkouts."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) =>
            editId === addr.id ? (
              <AddressForm key={addr.id} onCancel={cancelForm} />
            ) : (
              <div key={addr.id} className="border border-[var(--border)] p-6 hover:border-[#BBBBBB] transition-colors duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {addr.label && (
                        <span className="text-[10px] tracking-[0.2em] uppercase bg-[#F5F5F5] text-[var(--black)] px-2 py-0.5">
                          {addr.label}
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="text-[10px] tracking-[0.1em] uppercase text-green-600 border border-green-200 bg-green-50 px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-[var(--black)]">{addr.fullName}</p>
                    <p className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">
                      {addr.street}, {addr.city}{addr.province ? `, ${addr.province}` : ""}, {addr.country}
                    </p>
                    {addr.postalCode && (
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{addr.postalCode}</p>
                    )}
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">{addr.phone}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(addr)}
                      className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors border border-[var(--border)] hover:border-[var(--black)] px-3 py-1.5"
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors border border-[var(--border)] hover:border-[var(--black)] px-3 py-1.5"
                      >
                        Set Default
                      </button>
                    )}
                    {deleteId === addr.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={deleting}
                          className="text-[10px] px-2 py-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          {deleting ? "…" : "Yes"}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-[10px] px-2 py-1.5 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--black)] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(addr.id)}
                        className="text-[10px] tracking-[0.15em] uppercase text-red-400 hover:text-red-600 transition-colors border border-red-100 hover:border-red-300 px-3 py-1.5"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {showAdd && (
        <div className="mt-4">
          <AddressForm onCancel={cancelForm} />
        </div>
      )}
    </div>
  );
}
