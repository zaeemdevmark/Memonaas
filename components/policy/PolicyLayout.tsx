import Link from "next/link";

export interface PolicySection {
  id:      string;
  title:   string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  badge:       string;
  title:       string;
  description: string;
  lastUpdated: string;
  sections:    PolicySection[];
  cta?:        React.ReactNode;
}

export default function PolicyLayout({
  badge,
  title,
  description,
  lastUpdated,
  sections,
  cta,
}: PolicyLayoutProps) {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--bg)] py-16 sm:py-24 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--muted)] mb-4">{badge}</p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--black)] mb-5 leading-tight"
          >
            {title}
          </h1>
          <div className="w-10 h-px bg-[var(--black)] mx-auto mb-5" />
          <p className="text-[13px] sm:text-[14px] text-[var(--muted)] leading-relaxed max-w-lg mx-auto mb-3">
            {description}
          </p>
          <p className="text-[11px] text-[var(--muted)] opacity-60">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-16 items-start">

            {/* Sticky ToC sidebar */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-24">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
                Contents
              </p>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2.5 py-2 text-[12px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors group"
                  >
                    <span className="text-[10px] tabular-nums text-[var(--border)] group-hover:text-[var(--muted)] transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{s.title}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-3">Need Help?</p>
                <Link
                  href="/contact-us"
                  className="text-[11px] text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity"
                >
                  Contact Support →
                </Link>
              </div>
            </aside>

            {/* Policy sections */}
            <div className="lg:col-span-3 space-y-12">
              {sections.map((s) => (
                <PolicySection key={s.id} id={s.id} title={s.title}>
                  {s.content}
                </PolicySection>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Optional CTA */}
      {cta && (
        <div className="border-t border-[var(--border)]">
          {cta}
        </div>
      )}
    </>
  );
}

// ── Sub-component: individual section ─────────────────────────────

export function PolicySection({
  id,
  title,
  children,
}: {
  id:       string;
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <h2
        className="text-2xl sm:text-3xl font-light text-[var(--black)] mb-5"
      >
        {title}
      </h2>
      <div className="text-[13px] text-[var(--muted)] leading-relaxed space-y-3 border-b border-[var(--border)] pb-12">
        {children}
      </div>
    </div>
  );
}

// ── Shared prose helpers ──────────────────────────────────────────

export function PolicyP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-2 w-1 h-1 rounded-full bg-[var(--muted)] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PolicySteps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="space-y-4 pl-0">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-4">
          <span
            className="shrink-0 w-7 h-7 rounded-full border border-[var(--black)] flex items-center justify-center text-[11px] font-medium text-[var(--black)] mt-0.5"
          >
            {i + 1}
          </span>
          <div>
            <p className="text-[13px] font-medium text-[var(--black)] mb-0.5">{step.title}</p>
            <p className="text-[13px] text-[var(--muted)]">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PolicyCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[var(--black)] pl-4 py-1 bg-[var(--bg)] pr-4">
      <p className="text-[13px] text-[var(--black)] font-medium leading-relaxed">{children}</p>
    </div>
  );
}

export function PolicyContactBox({
  phone,
  email,
  hours,
}: {
  phone: string;
  email: string;
  hours?: string;
}) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] p-5 space-y-3 mt-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">Contact Support</p>
      <div className="space-y-1.5">
        <p className="text-[13px] text-[var(--black)]">
          <span className="text-[var(--muted)] mr-2">WhatsApp</span>
          <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} className="hover:opacity-70 transition-opacity underline underline-offset-2">
            {phone}
          </a>
        </p>
        <p className="text-[13px] text-[var(--black)]">
          <span className="text-[var(--muted)] mr-2">Email</span>
          <a href={`mailto:${email}`} className="hover:opacity-70 transition-opacity underline underline-offset-2">
            {email}
          </a>
        </p>
        {hours && (
          <p className="text-[13px] text-[var(--muted)]">{hours}</p>
        )}
      </div>
    </div>
  );
}
