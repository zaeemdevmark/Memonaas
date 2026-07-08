"use client";

import { useState } from "react";
import { Spinner, SuccessBanner, ErrorBanner } from "./ui";

export default function PasswordForm() {
  const [pw,      setPw]      = useState({ current: "", next: "", confirm: "" });
  const [errors,  setErrors]  = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  function validate(): boolean {
    const e: typeof errors = {};
    if (!pw.current)               e.current = "Current password is required.";
    if (!pw.next || pw.next.length < 8) e.next = "New password must be at least 8 characters.";
    if (pw.next !== pw.confirm)    e.confirm  = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/user/password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setPw({ current: "", next: "", confirm: "" });
      setSuccess("Password changed successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const FIELDS = [
    { key: "current" as const, label: "Current Password" },
    { key: "next"    as const, label: "New Password"     },
    { key: "confirm" as const, label: "Confirm New Password" },
  ];

  return (
    <div className="border border-[var(--border)] p-6">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--black)] font-medium mb-6">Change Password</p>

      {success && <div className="mb-5"><SuccessBanner msg={success} /></div>}
      {error   && <div className="mb-5"><ErrorBanner   msg={error}   /></div>}

      <div className="space-y-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">{label}</label>
            <input
              type="password"
              value={pw[key]}
              onChange={(e) => {
                setPw((p) => ({ ...p, [key]: e.target.value }));
                setErrors((p) => ({ ...p, [key]: undefined }));
              }}
              className={`w-full border px-4 py-3 text-[13px] text-[var(--black)] bg-white outline-none transition-colors rounded-none ${
                errors[key]
                  ? "border-red-300 focus:border-red-400"
                  : "border-[var(--border)] focus:border-[var(--black)]"
              }`}
            />
            {errors[key] && <p className="text-[11px] text-red-500">{errors[key]}</p>}
          </div>
        ))}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
          >
            {saving ? <><Spinner /><span>Updating…</span></> : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
