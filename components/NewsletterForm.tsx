"use client";

export default function NewsletterForm() {
  return (
    <form
      className="flex gap-0"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Your email address"
        className="flex-1 border border-[var(--border)] border-r-0 px-3 py-2.5 text-sm text-[var(--black)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--black)] transition-colors bg-white"
      />
      <button
        type="submit"
        className="bg-black text-white text-xs tracking-[0.1em] uppercase px-5 py-2.5 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
