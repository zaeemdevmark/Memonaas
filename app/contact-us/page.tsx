import type { Metadata } from "next";
import { buildMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";
import ContactForm from "@/components/contact/ContactForm";
import FaqAccordion from "@/components/contact/FaqAccordion";

// ── SEO ───────────────────────────────────────────────────────────

export const metadata: Metadata = buildMetadata({
  title:       `Contact Us — ${SITE_NAME}`,
  description: "Get in touch with Memonaas. Reach us by phone, WhatsApp, or email — our team is ready to assist you with orders, returns, sizing, and any other enquiries.",
  path:        "/contact-us",
  keywords:    ["contact Memonaas", "Memonaas support", "fashion customer service Pakistan", "Memonaas email"],
});

// ── Structured Data ───────────────────────────────────────────────

function ContactPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "ContactPage",
    name:       `Contact Us — ${SITE_NAME}`,
    url:        `${SITE_URL}/contact-us`,
    description: "Get in touch with the Memonaas team.",
    publisher: {
      "@type":       "Organization",
      name:          SITE_NAME,
      url:           SITE_URL,
      contactPoint: {
        "@type":             "ContactPoint",
        telephone:           "+92-327-6248585",
        contactType:         "customer service",
        areaServed:          "PK",
        availableLanguage:   ["English", "Urdu"],
        hoursAvailable: {
          "@type":     "OpeningHoursSpecification",
          dayOfWeek:   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens:       "10:00",
          closes:      "19:00",
        },
      },
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

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[10px] tracking-[0.35em] uppercase mb-4 ${light ? "text-white/40" : "text-[var(--muted)]"}`}>
      {children}
    </p>
  );
}

// ── 1. Hero ───────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <SectionLabel>Get in Touch</SectionLabel>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-light text-[var(--black)] mb-6 leading-tight"
        >
          We&apos;re Here to Help
        </h1>
        <div className="w-10 h-px bg-[var(--black)] mx-auto mb-6" />
        <p className="text-[14px] sm:text-[15px] text-[var(--muted)] leading-relaxed max-w-lg mx-auto">
          Have a question about an order, need sizing advice, or just want to say hello?
          Our team is ready to assist you Monday through Saturday.
        </p>
      </div>
    </section>
  );
}

// ── 2. Contact Cards ─────────────────────────────────────────────

const CONTACT_INFO = [
  {
    title: "Phone",
    value: "+92 327 6248585",
    sub:   "Call us directly",
    href:  "tel:+923276248585",
    icon:  (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    title: "WhatsApp",
    value: "+92 327 6248585",
    sub:   "Chat with us",
    href:  "https://wa.me/923276248585",
    icon:  (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    title: "Email",
    value: "wecare@memonaas.com",
    sub:   "We reply within 24 hours",
    href:  "mailto:wecare@memonaas.com",
    icon:  (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Business Hours",
    value: "Mon – Sat",
    sub:   "10:00 AM – 7:00 PM PKT",
    href:  null,
    icon:  (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

function ContactCardsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
          {CONTACT_INFO.map((info) => {
            const inner = (
              <div className="bg-white p-7 sm:p-8 group hover:bg-[var(--black)] transition-colors duration-300 h-full flex flex-col">
                <div className="text-[var(--muted)] group-hover:text-white/50 transition-colors duration-300 mb-4">
                  {info.icon}
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] group-hover:text-white/40 transition-colors duration-300 mb-2">
                  {info.title}
                </p>
                <p
                  className="text-lg font-light text-[var(--black)] group-hover:text-white transition-colors duration-300 mb-1"
                >
                  {info.value}
                </p>
                <p className="text-[11px] text-[var(--muted)] group-hover:text-white/50 transition-colors duration-300 mt-auto">
                  {info.sub}
                </p>
              </div>
            );

            return info.href ? (
              <a
                key={info.title}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block"
              >
                {inner}
              </a>
            ) : (
              <div key={info.title}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── 3. Form + Store Info ──────────────────────────────────────────

function FormSection() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <SectionLabel>Send Us a Message</SectionLabel>
            <h2
              className="text-3xl sm:text-4xl font-light text-[var(--black)] mb-8"
            >
              Write to Us
            </h2>
            <ContactForm />
          </div>

          {/* Store Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <SectionLabel>Reach Us Directly</SectionLabel>
              <h2
                className="text-3xl sm:text-4xl font-light text-[var(--black)] mb-6"
              >
                Get In Touch
              </h2>

              <div className="space-y-5">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-1.5">Business Name</p>
                  <p className="text-[14px] font-medium text-[var(--black)]">Memonaas</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-1.5">Working Hours</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--muted)]">Monday – Friday</span>
                      <span className="text-[var(--black)] font-medium">10:00 – 19:00</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--muted)]">Saturday</span>
                      <span className="text-[var(--black)] font-medium">11:00 – 18:00</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--muted)]">Sunday</span>
                      <span className="text-red-500 font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick contact buttons */}
            <div className="space-y-2.5">
              <a
                href="tel:+923276248585"
                className="flex items-center gap-3 py-3.5 px-5 border border-[var(--black)] text-[var(--black)] hover:bg-[var(--black)] hover:text-white transition-colors duration-200 group w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span className="text-[11px] tracking-[0.15em] uppercase">Call Us Now</span>
              </a>
              <a
                href="https://wa.me/923276248585"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3.5 px-5 bg-[#25D366] text-white hover:bg-[#1ebe5c] transition-colors duration-200 w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="text-[11px] tracking-[0.15em] uppercase">Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── 4. FAQ ────────────────────────────────────────────────────────

function FaqSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <SectionLabel>Common Questions</SectionLabel>
          <h2
            className="text-4xl sm:text-5xl font-light text-[var(--black)]"
          >
            Frequently Asked Questions
          </h2>
        </div>
        <FaqAccordion />
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function ContactUsPage() {
  return (
    <>
      <ContactPageSchema />
      <HeroSection />
      <ContactCardsSection />
      <FormSection />
      <FaqSection />
    </>
  );
}
