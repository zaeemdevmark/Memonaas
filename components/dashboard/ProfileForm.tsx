"use client";

import { useState } from "react";
import type { UserProfileDTO } from "@/lib/types/user";
import { Spinner, InlineInput, SuccessBanner, ErrorBanner, initials } from "./ui";

interface Props {
  initialProfile: UserProfileDTO;
}

export default function ProfileForm({ initialProfile }: Props) {
  const [profile,  setProfile]  = useState(initialProfile);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ name: initialProfile.name, phone: initialProfile.phone ?? "" });
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  function flash(msg: string, type: "success" | "error") {
    if (type === "success") { setSuccess(msg); setError(""); }
    else                    { setError(msg);   setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  }

  async function handleSave() {
    if (!form.name.trim()) { flash("Name is required.", "error"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update profile");
      setProfile(data.data);
      setEditing(false);
      flash("Profile updated successfully.", "success");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setForm({ name: profile.name, phone: profile.phone ?? "" });
    setEditing(false);
  }

  return (
    <div className="border border-[var(--border)] p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <span className="text-[var(--surface)] text-[13px] font-medium">
              {initials(profile.name)}
            </span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--black)]">{profile.name}</p>
            <p className="text-[11px] text-[var(--muted)]">Member</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => { setForm({ name: profile.name, phone: profile.phone ?? "" }); setEditing(true); }}
            className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors border border-[var(--border)] hover:border-[var(--accent)] px-3 py-1.5"
          >
            Edit
          </button>
        )}
      </div>

      {success && <div className="mb-5"><SuccessBanner msg={success} /></div>}
      {error   && <div className="mb-5"><ErrorBanner   msg={error}   /></div>}

      {editing ? (
        <div className="space-y-4">
          <InlineInput label="Full Name"    value={form.name}  onChange={(v) => setForm((f) => ({ ...f, name: v }))}  placeholder="Sara Khan" />
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">Email Address</label>
            <p className="w-full border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[13px] text-[var(--muted)]">
              {profile.email}
            </p>
            <p className="text-[10px] text-[var(--muted)]">Email cannot be changed here.</p>
          </div>
          <InlineInput label="Phone Number" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+92 300 0000000" type="tel" />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--ink)] text-[var(--surface)] text-[11px] tracking-[0.2em] uppercase hover:bg-[var(--accent-ink)] transition-colors disabled:opacity-60"
            >
              {saving ? <><Spinner /><span>Saving…</span></> : "Save Changes"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-3 border border-[var(--border)] text-[var(--muted)] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {[
            ["Full Name",     profile.name],
            ["Email Address", profile.email],
            ["Phone Number",  profile.phone ?? "—"],
          ].map(([label, val]) => (
            <div key={label} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-1">{label}</p>
              <p className="text-[13px] text-[var(--black)]">{val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
