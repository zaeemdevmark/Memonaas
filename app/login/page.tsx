"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

// ── Shared primitives ─────────────────────────────────────────────

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

function Field({
  label, error, type = "text", value, onChange, placeholder, autoComplete,
}: {
  label: string; error?: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">{label}</label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        className={`w-full border px-4 py-3.5 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
          error ? "border-red-300 focus:border-red-400" : "border-[#E8E8E8] focus:border-[var(--black)]"
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

function PasswordField({
  label, error, value, onChange, placeholder, autoComplete,
}: {
  label: string; error?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`w-full border px-4 py-3.5 pr-11 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
            error ? "border-red-300 focus:border-red-400" : "border-[#E8E8E8] focus:border-[var(--black)]"
          }`}
        />
        <button type="button" onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--black)] transition-colors">
          <EyeIcon open={show} />
        </button>
      </div>
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

function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[var(--black)] flex-col items-center justify-center p-14 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_20%,#222222,#0d0d0d)]" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 text-center">
        <Link href="/"><Image src="/logo.png" alt="Memonaas" width={160} height={60} className="h-12 w-auto object-contain brightness-0 invert mx-auto mb-12" /></Link>
        <p className="text-white/40 text-[10px] tracking-[0.35em] uppercase mb-4">Welcome back</p>
        <h2 className="text-white text-[42px] font-light leading-tight">Elegance<br />awaits you</h2>
        <div className="w-10 h-px bg-white/20 mx-auto mt-8 mb-8" />
        <p className="text-white/35 text-[11px] tracking-wide leading-relaxed max-w-[220px] mx-auto">
          Sign in to access your orders, wishlist, and exclusive member offers.
        </p>
      </div>
    </div>
  );
}

// ── Two-step login form ───────────────────────────────────────────

type Step = "email" | "no-account" | "password";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string; general?: string }>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !EMAIL_RE.test(email)) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/check-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setStep(data.data?.exists ? "password" : "no-account");
    } catch {
      setErrors({ general: "Could not check email. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setErrors({ password: "Password is required." }); return; }
    setErrors({});
    setLoading(true);

    const result = await signIn("credentials", {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrors({ general: "Incorrect password. Please try again." });
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();
    const callbackUrl = searchParams.get("callbackUrl");

    if (callbackUrl) {
      router.replace(callbackUrl);
    } else if (session?.user?.role === "Admin") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-96px)]">
      <AuthPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden mb-10 text-center">
            <Link href="/"><Image src="/logo.png" alt="Memonaas" width={130} height={50} className="h-9 w-auto object-contain mx-auto" /></Link>
          </div>

          {/* Step: email */}
          {step === "email" && (
            <>
              <h1 className="text-4xl font-light text-[var(--black)] mb-2">Sign In</h1>
              <p className="text-[12px] text-[var(--muted)] mb-10">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[var(--black)] underline underline-offset-2 hover:opacity-50 transition-opacity">Create one</Link>
              </p>
              <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
                {errors.general && (
                  <div className="border border-red-200 bg-red-50 text-red-600 text-[12px] px-4 py-3">{errors.general}</div>
                )}
                <Field
                  label="Email Address" type="email" value={email}
                  onChange={(v) => { setEmail(v); setErrors({}); }}
                  placeholder="you@example.com" autoComplete="email" error={errors.email}
                />
                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5">
                    {loading ? <><Spinner /><span>Checking…</span></> : "Continue"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step: no account found */}
          {step === "no-account" && (
            <>
              <h1 className="text-4xl font-light text-[var(--black)] mb-2">No Account Found</h1>
              <p className="text-[12px] text-[var(--muted)] mb-10">
                No account exists for <span className="text-[var(--black)] font-medium">{email}</span>.
                You can shop as a guest or create an account to track your orders.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/register?email=${encodeURIComponent(email)}`}
                  className="block w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase text-center hover:bg-[#2a2a2a] transition-colors duration-200"
                >
                  Create Account
                </Link>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setEmail(""); setErrors({}); }}
                  className="w-full py-4 border border-[#E8E8E8] text-[11px] tracking-[0.2em] uppercase text-[var(--muted)] hover:border-[var(--black)] hover:text-[var(--black)] transition-colors"
                >
                  Try a Different Email
                </button>
              </div>
            </>
          )}

          {/* Step: password */}
          {step === "password" && (
            <>
              <h1 className="text-4xl font-light text-[var(--black)] mb-2">Welcome Back</h1>
              <p className="text-[12px] text-[var(--muted)] mb-10">
                Signing in as <span className="text-[var(--black)] font-medium">{email}</span>.{" "}
                <button type="button" onClick={() => { setStep("email"); setPassword(""); setErrors({}); }}
                  className="underline underline-offset-2 hover:opacity-50 transition-opacity">
                  Not you?
                </button>
              </p>
              <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
                {errors.general && (
                  <div className="border border-red-200 bg-red-50 text-red-600 text-[12px] px-4 py-3">{errors.general}</div>
                )}
                <PasswordField
                  label="Password" value={password}
                  onChange={(v) => { setPassword(v); setErrors({}); }}
                  placeholder="Enter your password" autoComplete="current-password" error={errors.password}
                />
                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5">
                    {loading ? <><Spinner /><span>Signing in…</span></> : "Sign In"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
