import Link from "next/link";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/helpers";

export const metadata = { title: "Forbidden — Nayab Posh" };

export default async function ForbiddenPage() {
  const session  = await auth();
  const backHref = isAdmin(session) ? "/admin" : "/dashboard";
  const backLabel = isAdmin(session) ? "Go to Admin Panel" : "Go to Dashboard";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Code */}
        <p
          className="text-[80px] font-light text-[#E8E8E8] leading-none mb-2 select-none"
        >
          403
        </p>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full border border-[#E8E8E8] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
              className="w-6 h-6 text-[#AAAAAA]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1
          className="text-2xl font-light text-[var(--black)] mb-3"
        >
          Access Denied
        </h1>
        <p className="text-[13px] text-[#888888] leading-relaxed mb-8">
          You don&apos;t have permission to view this page. If you believe this
          is a mistake, please contact support.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {session?.user ? (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200"
            >
              {backLabel}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E8E8E8] text-[#666666] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--black)] hover:text-[var(--black)] transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>

      </div>
    </div>
  );
}
