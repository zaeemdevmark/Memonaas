"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

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

export default function AdminLoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please check your email and password.");
      setLoading(false);
      return;
    }

    // Verify the logged-in user is actually an admin
    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();

    if (session?.user?.role !== "Admin") {
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <Image src="/logo.png" alt="Nayab Posh" width={140} height={52} className="h-10 w-auto object-contain brightness-0 invert mx-auto mb-6" />
          </Link>
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-1">Administrator Sign In</h1>
          <p className="text-white/40 text-[12px] mb-8">Enter your admin credentials to continue.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-white/50 text-[10px] tracking-[0.15em] uppercase block">Email</label>
              <input
                type="email" value={email} autoComplete="email"
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none rounded-lg transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-[10px] tracking-[0.15em] uppercase block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} autoComplete="current-password"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 pr-11 text-[13px] text-white placeholder-white/20 outline-none rounded-lg transition-colors"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-white text-[#0f172a] text-[12px] font-semibold tracking-[0.1em] uppercase rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Spinner /><span>Signing in…</span></> : "Sign In to Admin"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-white/20 text-[11px]">
          Not an admin?{" "}
          <Link href="/login" className="text-white/40 underline underline-offset-2 hover:text-white/60 transition-colors">
            Customer login
          </Link>
        </p>
      </div>
    </div>
  );
}
