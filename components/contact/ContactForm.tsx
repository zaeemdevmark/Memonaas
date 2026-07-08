"use client";

import { useState } from "react";

interface FormState {
  name:    string;
  email:   string;
  phone:   string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?:    string;
  email?:   string;
  subject?: string;
  message?: string;
  general?: string;
}

const INITIAL_STATE: FormState = { name: "", email: "", phone: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECTS = [
  "General Enquiry",
  "Order Assistance",
  "Returns & Exchanges",
  "Product Information",
  "Sizing Help",
  "Wholesale Enquiry",
  "Other",
];

function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError?: string) =>
  `w-full border px-4 py-3.5 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-[#E8E8E8] focus:border-[var(--black)]"
  }`;

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function ContactForm() {
  const [form,    setForm]    = useState<FormState>(INITIAL_STATE);
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = "Full name is required.";
    if (!form.email.trim())   e.email   = "Email address is required.";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Please enter a valid email address.";
    if (!form.subject.trim()) e.subject = "Please select a subject.";
    if (!form.message.trim()) e.message = "Message is required.";
    else if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error ?? "Something went wrong. Please try again." });
        return;
      }

      setSuccess(true);
      setForm(INITIAL_STATE);
    } catch {
      setErrors({ general: "Unable to send your message. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
        <div className="w-14 h-14 rounded-full border-2 border-[var(--black)] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-2">Message Received</p>
          <h3 className="text-2xl font-light text-[var(--black)] mb-2">
            Thank You for Reaching Out
          </h3>
          <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
            We have received your message and will get back to you within 1–2 business days.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-[11px] tracking-[0.2em] uppercase text-[var(--muted)] hover:text-[var(--black)] transition-colors underline underline-offset-2 mt-2"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.general && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldWrapper label="Full Name *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            className={inputClass(errors.name)}
          />
        </FieldWrapper>

        <FieldWrapper label="Email Address *" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            className={inputClass(errors.email)}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldWrapper label="Phone Number">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+92 300 000 0000"
            autoComplete="tel"
            className={inputClass()}
          />
        </FieldWrapper>

        <FieldWrapper label="Subject *" error={errors.subject}>
          <select
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            className={`${inputClass(errors.subject)} cursor-pointer`}
          >
            <option value="" disabled>Select a subject…</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FieldWrapper>
      </div>

      <FieldWrapper label="Message *" error={errors.message}>
        <textarea
          rows={6}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Write your message here…"
          className={`${inputClass(errors.message)} resize-none`}
        />
      </FieldWrapper>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto py-4 px-10 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] active:bg-[#444] transition-colors duration-200 disabled:opacity-60 flex items-center gap-2.5"
        >
          {loading ? (
            <><Spinner /><span>Sending…</span></>
          ) : (
            "Send Message"
          )}
        </button>
      </div>

      <p className="text-[11px] text-[var(--muted)]">
        * Required fields. We typically respond within 1–2 business days.
      </p>
    </form>
  );
}
