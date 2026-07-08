import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";

// ── SEO ───────────────────────────────────────────────────────────

export const metadata: Metadata = buildMetadata({
  title:       `About Us — ${SITE_NAME}`,
  description: "Discover the story behind Memonaas — a Pakistani clothing brand built on considered design, honest fabrics, and everyday wearability.",
  path:        "/about-us",
  keywords:    ["Memonaas", "Pakistani clothing brand", "about us", "everyday women's fashion", "women fashion Pakistan"],
});

// ── Structured Data ───────────────────────────────────────────────

function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "AboutPage",
    name:       `About Us — ${SITE_NAME}`,
    url:        `${SITE_URL}/about-us`,
    description: "The story, values, and philosophy behind Memonaas.",
    publisher: {
      "@type": "Organization",
      name:    SITE_NAME,
      url:     SITE_URL,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Shared primitives ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--muted)] mb-4">
      {children}
    </p>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-10 h-px bg-[var(--black)] ${className}`} />;
}

// ── 1. Hero ───────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <SectionLabel>About Us</SectionLabel>
        <h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-[var(--ink)] mb-6 leading-tight"
        >
          Considered by
          <br className="hidden sm:block" />
          {" "}Design
        </h1>
        <Divider className="mx-auto mb-6" />
        <p className="text-[14px] sm:text-[15px] text-[var(--muted)] leading-relaxed max-w-xl mx-auto">
          Memonaas makes clothing for the days that make up most of your life — not just the
          special ones. Modern silhouettes, honest fabrics, and pieces built to be worn often.
        </p>
      </div>
    </section>
  );
}

// ── 2. Our Story ─────────────────────────────────────────────────

function StorySection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Text */}
          <div>
            <SectionLabel>Our Story</SectionLabel>
            <h2
              className="font-display text-4xl sm:text-5xl text-[var(--ink)] mb-8 leading-tight"
            >
              Clothing for the everyday
            </h2>
            <div className="space-y-5 text-[13px] text-[var(--muted)] leading-relaxed">
              <p>
                Memonaas started with a simple frustration: most clothing is designed to look good
                for a photo, not to hold up to actual life. We wanted pieces that could be worn
                on a Tuesday and still feel considered — not just something reserved for special occasions.
              </p>
              <p>
                From the beginning, our approach has been the same: fewer, better pieces. We spend
                more time on fit, fabric, and construction than on chasing whatever's trending, because
                the things you reach for most often deserve the most care.
              </p>
              <p>
                We work directly with trusted mills and small production runs, which means we can
                stand behind the quality of every seam and every fabric choice — not just the ones
                that photograph well.
              </p>
              <p>
                Memonaas is still small and growing, and we intend to keep it that way for a while:
                slower, more deliberate, and built around the customer rather than the trend cycle.
              </p>
            </div>

            <div className="flex items-center gap-10 mt-10 pt-10 border-t border-[var(--border)]">
              {[
                { value: "New",  label: "Brand, Est. 2026" },
                { value: "PK",   label: "Designed & Made" },
                { value: "1:1",  label: "Care Per Order" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="font-display text-3xl text-[var(--ink)]"
                  >
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pull-quote panel */}
          <div className="bg-[var(--ink)] p-10 sm:p-12 text-[var(--surface)] flex flex-col justify-between min-h-[380px]">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6"
            >
              Our Mission
            </p>
            <blockquote
              className="font-display text-3xl sm:text-4xl leading-snug italic flex-1"
            >
              &ldquo;Make clothing worth reaching for every day — not just the days that call for it.&rdquo;
            </blockquote>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-[12px] text-white/60 leading-relaxed">
                Our mission is to make considered, well-made clothing accessible without the
                markup that usually comes with it.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── 3. Why Choose Us ─────────────────────────────────────────────

const FEATURES = [
  {
    title: "Considered Quality",
    description: "Every garment undergoes quality checks before it reaches you. We partner with trusted fabric suppliers so materials hold up to daily wear, not just first impressions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "Modern Silhouettes",
    description: "Our in-house design team keeps pieces simple and versatile, so they mix easily into a wardrobe you already wear rather than fighting it.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    description: "We understand that waiting is the hardest part. Our efficient logistics network ensures your order arrives within 3–5 business days, nationwide.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Customer Satisfaction",
    description: "Your happiness is our measure of success. Our dedicated support team is always ready to assist you — before, during, and after your purchase.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
  },
  {
    title: "Secure Shopping",
    description: "Shop with complete peace of mind. Our platform uses industry-standard encryption to protect your personal information at every step.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: "Built on Trust",
    description: "We're a new brand, and we know trust is earned order by order. That's why we're upfront about fabric, fit, and delivery timelines from the start.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
];

function WhyChooseSection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Why Choose Us</SectionLabel>
          <h2
            className="font-display text-4xl sm:text-5xl text-[var(--ink)]"
          >
            The Memonaas Difference
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--surface)] p-8 sm:p-10 group hover:bg-[var(--ink)] transition-colors duration-300"
            >
              <div className="text-[var(--accent)] group-hover:text-white/50 transition-colors duration-300 mb-5">
                {feature.icon}
              </div>
              <h3
                className="text-xl font-medium text-[var(--ink)] group-hover:text-[var(--surface)] transition-colors duration-300 mb-3"
              >
                {feature.title}
              </h3>
              <p className="text-[12px] text-[var(--muted)] group-hover:text-white/60 transition-colors duration-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 4. Our Values ─────────────────────────────────────────────────

const VALUES = [
  {
    number: "01",
    title:  "Quality",
    description: "We never compromise. From fabric selection to the final stitch, every detail matters and every garment must meet our exacting standards before it reaches you.",
  },
  {
    number: "02",
    title:  "Trust",
    description: "Honesty and transparency are the foundation of everything we do. We build lasting relationships with our customers through open communication and integrity.",
  },
  {
    number: "03",
    title:  "Simplicity",
    description: "We'd rather do a few things well than chase every trend. Clean designs, considered fabrics, and pieces that earn a place in your regular rotation.",
  },
  {
    number: "04",
    title:  "Customer First",
    description: "Every business decision we make begins and ends with one question: is this truly good for our customer? Your experience is the lens through which we view everything.",
  },
];

function ValuesSection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>What We Stand For</SectionLabel>
          <h2
            className="font-display text-4xl sm:text-5xl text-[var(--ink)]"
          >
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {VALUES.map((value) => (
            <div key={value.number} className="group">
              <p
                className="font-display text-5xl text-[var(--border)] group-hover:text-[var(--accent)] transition-colors duration-300 mb-4 leading-none"
              >
                {value.number}
              </p>
              <Divider className="mb-4 group-hover:w-16 transition-all duration-300" />
              <h3
                className="text-xl font-medium text-[var(--ink)] mb-3"
              >
                {value.title}
              </h3>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 5. Fashion Promise ────────────────────────────────────────────

const PROMISES = [
  {
    title: "Considered Collections",
    description: "Smaller, more deliberate collections — released when they're ready, not on a forced seasonal calendar.",
  },
  {
    title: "Honest Fabrics",
    description: "We source dependable lawns, cottons, and blends from trusted mills, and we're straightforward about what you're getting.",
  },
  {
    title: "Made to Last",
    description: "Our designs are built to be worn on repeat, not just once — pieces that earn a permanent spot in your wardrobe.",
  },
];

function PromiseSection() {
  return (
    <section className="py-24 sm:py-32 bg-[var(--ink)] text-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/40 mb-4">
            Our Commitment
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl leading-tight"
          >
            Our Promise
          </h2>
          <div className="w-10 h-px bg-white/30 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="bg-[var(--ink)] p-8 sm:p-10 text-center group hover:bg-white/5 transition-colors duration-300">
              <div className="w-8 h-px bg-white/30 mx-auto mb-6 group-hover:w-14 transition-all duration-300" />
              <h3
                className="text-2xl font-medium text-white mb-4"
              >
                {promise.title}
              </h3>
              <p className="text-[12px] text-white/50 leading-relaxed">
                {promise.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p
            className="font-display text-2xl sm:text-3xl italic text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            &ldquo;Clothing shouldn't need a special occasion to feel considered.
            At Memonaas, we design for the every day.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 6. CTA ────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <SectionLabel>Ready to Explore?</SectionLabel>
        <h2
          className="font-display text-4xl sm:text-5xl text-[var(--ink)] mb-6"
        >
          Begin Your Everyday
        </h2>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-md mx-auto mb-10">
          Explore the collection and see what considered, everyday clothing looks like.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="py-4 px-10 bg-[var(--ink)] text-[var(--surface)] text-[11px] tracking-[0.25em] uppercase hover:bg-[var(--accent-ink)] transition-colors duration-200"
          >
            Shop Collection
          </Link>
          <Link
            href="/contact-us"
            className="btn-fill py-4 px-10 border border-[var(--ink)] text-[var(--ink)] text-[11px] tracking-[0.25em] uppercase"
          >
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function AboutUsPage() {
  return (
    <>
      <AboutPageSchema />
      <HeroSection />
      <StorySection />
      <WhyChooseSection />
      <ValuesSection />
      <PromiseSection />
      <CtaSection />
    </>
  );
}
