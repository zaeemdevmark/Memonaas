import Link from "next/link";

export const metadata = { title: "Unauthorized — Memonaas" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Code */}
        <p
          className="text-[80px] font-light text-[#E8E8E8] leading-none mb-2 select-none"
        >
          401
        </p>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1
          className="text-2xl font-light text-[var(--black)] mb-3"
        >
          Authentication Required
        </h1>
        <p className="text-[13px] text-[#888888] leading-relaxed mb-8">
          You need to be signed in to access this page. Please log in to
          continue.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] text-[#666666] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--black)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>

      </div>
    </div>
  );
}
