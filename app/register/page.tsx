"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Shared primitives ────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ label, error, type = "text", value, onChange, placeholder, autoComplete }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full border px-4 py-3.5 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-[#E8E8E8] focus:border-[var(--black)]"
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}

function PasswordField({ label, error, value, onChange, placeholder, autoComplete, hint }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const strength = value.length === 0 ? 0 : value.length < 6 ? 1 : value.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-green-500"][strength];

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full border px-4 py-3.5 pr-11 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
            error
              ? "border-red-300 focus:border-red-400"
              : "border-[#E8E8E8] focus:border-[var(--black)]"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--black)] transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {/* Strength bar (only for primary password) */}
      {hint && value.length > 0 && (
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex gap-1 flex-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-[#E8E8E8]"}`}
              />
            ))}
          </div>
          <span className={`text-[10px] tracking-wide ${["", "text-red-400", "text-amber-500", "text-green-600"][strength]}`}>
            {strengthLabel}
          </span>
        </div>
      )}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Left decorative panel ────────────────────────────────────────

function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[var(--black)] flex-col items-center justify-center p-14 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_80%,#222222,#0d0d0d)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10 text-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Nayab Posh"
            width={160}
            height={60}
            className="h-12 w-auto object-contain brightness-0 invert mx-auto mb-12"
          />
        </Link>
        <p className="text-white/40 text-[10px] tracking-[0.35em] uppercase mb-4">Join us</p>
        <h2
          className="text-white text-[42px] font-light leading-tight"
        >
          Begin your<br />journey
        </h2>
        <div className="w-10 h-px bg-white/20 mx-auto mt-8 mb-8" />
        <p className="text-white/35 text-[11px] tracking-wide leading-relaxed max-w-[220px] mx-auto">
          Create an account to unlock exclusive collections, early access, and personalised offers.
        </p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterPage() {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Errors>({});
  const [success, setSuccess]     = useState(false);

  function clearField(field: keyof Errors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim() || name.trim().length < 2) {
      e.name = "Please enter your full name (at least 2 characters).";
    }
    if (!email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!confirm) {
      e.confirm = "Please confirm your password.";
    } else if (confirm !== password) {
      e.confirm = "Passwords do not match.";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:     name.trim(),
          email:    email.trim().toLowerCase(),
          password,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setErrors({ name: json.error ?? "Failed to create account. Please try again." });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ name: "A network error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-96px)]">
      <AuthPanel />

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/">
              <Image src="/logo.png" alt="Nayab Posh" width={130} height={50} className="h-9 w-auto object-contain mx-auto" />
            </Link>
          </div>

          {success ? (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h2
                className="text-3xl font-light text-[var(--black)] mb-3"
              >
                Account created
              </h2>
              <p className="text-[12px] text-[var(--muted)] mb-8">
                Welcome to Nayab Posh, {name.split(" ")[0]}. Your account is ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-8 py-3.5 border border-[var(--black)] text-[var(--black)] text-[11px] tracking-[0.25em] uppercase hover:bg-[#F5F5F5] transition-colors duration-200 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3.5 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200 text-center"
                >
                  Explore
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1
                className="text-4xl font-light text-[var(--black)] mb-2"
              >
                Create Account
              </h1>
              <p className="text-[12px] text-[var(--muted)] mb-10">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--black)] underline underline-offset-2 hover:opacity-50 transition-opacity">
                  Sign in
                </Link>
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                <Field
                  label="Full Name"
                  value={name}
                  onChange={(v) => { setName(v); clearField("name"); }}
                  placeholder="Your full name"
                  autoComplete="name"
                  error={errors.name}
                />

                <Field
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(v) => { setEmail(v); clearField("email"); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email}
                />

                <PasswordField
                  label="Password"
                  value={password}
                  onChange={(v) => { setPassword(v); clearField("password"); }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  error={errors.password}
                  hint="strength"
                />

                <PasswordField
                  label="Confirm Password"
                  value={confirm}
                  onChange={(v) => { setConfirm(v); clearField("confirm"); }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  error={errors.confirm}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] active:bg-[#444] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5"
                  >
                    {loading ? <><Spinner /><span>Creating account…</span></> : "Create Account"}
                  </button>
                </div>

                <p className="text-[10px] text-[var(--muted)] text-center leading-relaxed pt-1">
                  By creating an account you agree to our{" "}
                  <Link href="#" className="underline underline-offset-2 hover:text-[var(--black)] transition-colors">Terms</Link>
                  {" "}and{" "}
                  <Link href="#" className="underline underline-offset-2 hover:text-[var(--black)] transition-colors">Privacy Policy</Link>.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
