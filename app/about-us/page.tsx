import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";

// ── SEO ───────────────────────────────────────────────────────────

export const metadata: Metadata = buildMetadata({
  title:       `About Us — ${SITE_NAME}`,
  description: "Discover the story behind Memonaas — a Pakistani fashion brand built on a passion for elegance, quality craftsmanship, and celebrating the modern Pakistani woman.",
  path:        "/about-us",
  keywords:    ["Memonaas", "Pakistani fashion brand", "about us", "luxury Pakistani clothing", "women fashion Pakistan"],
});

// ── Structured Data ───────────────────────────────────────────────

function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "AboutPage",
    name:       `About Us — ${SITE_NAME}`,
    url:        `${SITE_URL}/about-us`,
    description: "The story, values, and vision behind Memonaas.",
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
          className="text-5xl sm:text-6xl lg:text-7xl font-light text-[var(--black)] mb-6 leading-tight"
        >
          Where Elegance
          <br className="hidden sm:block" />
          {" "}Meets Tradition
        </h1>
        <Divider className="mx-auto mb-6" />
        <p className="text-[14px] sm:text-[15px] text-[var(--muted)] leading-relaxed max-w-xl mx-auto">
          Memonaas is a celebration of Pakistani femininity — where the richness of our textile heritage
          is woven into every thread, every silhouette, and every collection we create.
        </p>
      </div>
    </section>
  );
}

// ── 2. Our Story ─────────────────────────────────────────────────

function StorySection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Text */}
          <div>
            <SectionLabel>Our Story</SectionLabel>
            <h2
              className="text-4xl sm:text-5xl font-light text-[var(--black)] mb-8 leading-tight"
            >
              A Legacy of Pakistani Elegance
            </h2>
            <div className="space-y-5 text-[13px] text-[var(--muted)] leading-relaxed">
              <p>
                Memonaas was born from a deep-seated love for Pakistani fashion and a desire to share it with the world.
                Our founders — passionate about the artistry embedded in traditional Pakistani textile heritage —
                set out to create a brand that would honour this craft while speaking to the contemporary Pakistani woman.
              </p>
              <p>
                From the very beginning, our vision was clear: to design clothing that bridges the timeless beauty of
                traditional Pakistani aesthetics with the clean lines and confidence of modern fashion. Every collection
                we release is a conversation between the old and the new — a dialogue between heritage and innovation.
              </p>
              <p>
                We believe that Pakistani women deserve clothing that reflects the richness of their culture. That is why
                we work with skilled artisans and trusted fabric suppliers to bring you garments crafted with intention —
                from the quality of the weave to the precision of the stitching.
              </p>
              <p>
                Today, Memonaas continues to grow with one unwavering principle: never compromise on quality,
                never compromise on elegance, and always put the customer first.
              </p>
            </div>

            <div className="flex items-center gap-10 mt-10 pt-10 border-t border-[var(--border)]">
              {[
                { value: "100+",   label: "Collections Launched" },
                { value: "5,000+", label: "Happy Customers" },
                { value: "3+",     label: "Years of Craft" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="text-3xl font-light text-[var(--black)]"
                  >
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pull-quote panel */}
          <div className="bg-[var(--black)] p-10 sm:p-12 text-white flex flex-col justify-between min-h-[380px]">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6"
            >
              Our Mission
            </p>
            <blockquote
              className="text-3xl sm:text-4xl font-light leading-snug italic flex-1"
            >
              &ldquo;To empower every Pakistani woman with clothing that honours her heritage
              and elevates her presence — crafted with love, worn with pride.&rdquo;
            </blockquote>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-[12px] text-white/60 leading-relaxed">
                Our mission is to make premium Pakistani fashion accessible to every woman — delivered with
                the care and elegance she deserves.
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
    title: "Premium Quality",
    description: "Every garment undergoes rigorous quality checks before it reaches you. We partner with trusted fabric suppliers to ensure our materials are of the highest standard.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "Elegant Designs",
    description: "Our in-house design team draws from Pakistan's rich cultural heritage, creating pieces that are timeless yet undeniably contemporary.",
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
    title: "Trusted Brand",
    description: "Thousands of women across Pakistan trust Memonaas for their fashion needs. Our growing community of loyal customers is our greatest testament.",
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
            className="text-4xl sm:text-5xl font-light text-[var(--black)]"
          >
            The Memonaas Difference
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-8 sm:p-10 group hover:bg-[var(--black)] transition-colors duration-300"
            >
              <div className="text-[var(--muted)] group-hover:text-white/50 transition-colors duration-300 mb-5">
                {feature.icon}
              </div>
              <h3
                className="text-xl font-light text-[var(--black)] group-hover:text-white transition-colors duration-300 mb-3"
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
    title:  "Innovation",
    description: "We constantly evolve — blending Pakistan's rich textile artistry with contemporary design sensibilities to create fashion that is both rooted and forward-looking.",
  },
  {
    number: "04",
    title:  "Customer First",
    description: "Every business decision we make begins and ends with one question: is this truly good for our customer? Your experience is the lens through which we view everything.",
  },
];

function ValuesSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>What We Stand For</SectionLabel>
          <h2
            className="text-4xl sm:text-5xl font-light text-[var(--black)]"
          >
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {VALUES.map((value) => (
            <div key={value.number} className="group">
              <p
                className="text-5xl font-light text-[var(--border)] group-hover:text-[var(--black)] transition-colors duration-300 mb-4 leading-none"
              >
                {value.number}
              </p>
              <Divider className="mb-4 group-hover:w-16 transition-all duration-300" />
              <h3
                className="text-xl font-light text-[var(--black)] mb-3"
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
    title: "Curated Collections",
    description: "Each collection is thoughtfully curated to reflect the season, the trends, and the cultural moments that define Pakistani fashion.",
  },
  {
    title: "Premium Fabrics",
    description: "We source only the finest materials — premium lawns, silks, chiffons, and cotton blends — from trusted mills across Pakistan and beyond.",
  },
  {
    title: "Timeless Silhouettes",
    description: "Our designs honour both modern sensibilities and traditional aesthetics, creating pieces that transcend seasons and remain wardrobe staples.",
  },
];

function PromiseSection() {
  return (
    <section className="py-24 sm:py-32 bg-[var(--black)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/40 mb-4">
            Our Commitment
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight"
          >
            Our Fashion Promise
          </h2>
          <div className="w-10 h-px bg-white/30 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="bg-[var(--black)] p-8 sm:p-10 text-center group hover:bg-white/5 transition-colors duration-300">
              <div className="w-8 h-px bg-white/30 mx-auto mb-6 group-hover:w-14 transition-all duration-300" />
              <h3
                className="text-2xl font-light text-white mb-4"
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
            className="text-2xl sm:text-3xl font-light italic text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            &ldquo;Fashion is not just about what you wear — it is about how wearing it makes you feel.
            At Memonaas, we design for that feeling.&rdquo;
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
          className="text-4xl sm:text-5xl font-light text-[var(--black)] mb-6"
        >
          Begin Your Fashion Journey
        </h2>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-md mx-auto mb-10">
          Explore our latest collections and discover what makes Memonaas the preferred choice of
          discerning Pakistani women.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="py-4 px-10 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200"
          >
            Shop Collection
          </Link>
          <Link
            href="/contact-us"
            className="py-4 px-10 border border-[var(--black)] text-[var(--black)] text-[11px] tracking-[0.25em] uppercase hover:bg-[var(--black)] hover:text-white transition-colors duration-200"
          >
            Contact Us
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
