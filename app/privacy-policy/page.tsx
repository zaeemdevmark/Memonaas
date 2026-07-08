import PolicyLayout, {
  PolicyP,
  PolicyList,
  PolicyCallout,
  PolicyContactBox,
} from "@/components/policy/PolicyLayout";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title:       "Privacy Policy",
  description: "Learn how Nayab Posh collects, uses, and protects your personal data. Your privacy is important to us.",
  path:        "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      badge="Legal"
      title="Privacy Policy"
      description={`At ${SITE_NAME}, we are committed to protecting your personal information and being transparent about how we use it. This policy explains what data we collect, why, and your rights around it.`}
      lastUpdated="June 2026"
      sections={[
        {
          id:    "who-we-are",
          title: "Who We Are",
          content: (
            <>
              <PolicyP>
                Nayab Posh is a women&apos;s fashion brand based in Lahore, Pakistan, operating online at nayabposh.com. References to &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; in this policy refer to Nayab Posh and its operators.
              </PolicyP>
              <PolicyP>
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at the details provided at the end of this document.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "data-collected",
          title: "Information We Collect",
          content: (
            <>
              <PolicyP>We collect information in two ways: information you provide directly to us, and information collected automatically.</PolicyP>
              <p className="text-[12px] font-medium text-[var(--black)] mt-3 mb-1.5">Information you provide:</p>
              <PolicyList
                items={[
                  "Name, email address, and phone number (when placing an order or creating an account)",
                  "Delivery address — street, city, province, postal code",
                  "Order details: items purchased, quantities, payment method",
                  "Messages you send us via the contact form or WhatsApp",
                  "Newsletter subscription preferences",
                ]}
              />
              <p className="text-[12px] font-medium text-[var(--black)] mt-4 mb-1.5">Information collected automatically:</p>
              <PolicyList
                items={[
                  "Device type, browser, operating system, and IP address",
                  "Pages visited, time spent on site, and referring URLs",
                  "Cookies and similar tracking technologies (see Cookie section below)",
                ]}
              />
              <PolicyP>
                We do not collect payment card details. All payments processed via our platform are handled by third-party payment providers and are subject to their own privacy policies.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "how-we-use",
          title: "How We Use Your Information",
          content: (
            <>
              <PolicyP>We use the information we collect for the following purposes:</PolicyP>
              <PolicyList
                items={[
                  "To process and fulfil your orders, and send order confirmations and dispatch notifications",
                  "To provide customer support and respond to your enquiries",
                  "To send account-related communications (password resets, important updates)",
                  "To send marketing emails and newsletters — only if you have opted in",
                  "To improve our website, products, and user experience through analytics",
                  "To detect and prevent fraud or misuse of our platform",
                  "To comply with legal obligations under Pakistani law",
                ]}
              />
              <PolicyCallout>
                We will never sell your personal data to third parties. We do not use your data for automated decision-making that significantly affects you.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "third-parties",
          title: "Third Parties We Share Data With",
          content: (
            <>
              <PolicyP>
                To operate our website and deliver orders, we share limited data with the following third-party service providers:
              </PolicyP>
              <div className="space-y-3 my-2">
                {[
                  {
                    name:    "Resend",
                    purpose: "Transactional email delivery (order confirmations, password resets)",
                    data:    "Name, email address",
                  },
                  {
                    name:    "Cloudinary",
                    purpose: "Image storage and delivery (product photos)",
                    data:    "No personal data",
                  },
                  {
                    name:    "TCS / Leopards / BlueEx",
                    purpose: "Courier services for order delivery",
                    data:    "Name, phone number, delivery address",
                  },
                  {
                    name:    "Vercel",
                    purpose: "Website hosting and server infrastructure",
                    data:    "IP address, request logs",
                  },
                ].map((tp) => (
                  <div key={tp.name} className="border border-[var(--border)] px-4 py-3">
                    <p className="text-[12px] font-medium text-[var(--black)]">{tp.name}</p>
                    <p className="text-[12px] text-[var(--muted)] mt-0.5">{tp.purpose}</p>
                    <p className="text-[11px] text-[var(--muted)] opacity-70 mt-0.5">Data shared: {tp.data}</p>
                  </div>
                ))}
              </div>
              <PolicyP>
                Each of these providers has their own privacy policy governing how they handle data. We only share the minimum data necessary for them to provide their service.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "cookies",
          title: "Cookies",
          content: (
            <>
              <PolicyP>
                Our website uses cookies — small text files stored on your device — to improve your experience and help us understand how our site is used.
              </PolicyP>
              <div className="space-y-2 my-2">
                {[
                  {
                    type:    "Essential cookies",
                    purpose: "Required for the website to function. These include session management, authentication, and cart state. Cannot be disabled.",
                  },
                  {
                    type:    "Analytics cookies",
                    purpose: "Help us understand how visitors interact with our site (pages viewed, time on site). Used in aggregate; no personally identifiable data is tracked.",
                  },
                  {
                    type:    "Preference cookies",
                    purpose: "Remember your choices such as language preference and checkout information to speed up your next visit.",
                  },
                ].map((c) => (
                  <div key={c.type} className="border-l-2 border-[var(--border)] pl-4 py-1">
                    <p className="text-[12px] font-medium text-[var(--black)]">{c.type}</p>
                    <p className="text-[12px] text-[var(--muted)] mt-0.5">{c.purpose}</p>
                  </div>
                ))}
              </div>
              <PolicyP>
                You can control cookies through your browser settings. Disabling essential cookies may affect website functionality.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "data-retention",
          title: "Data Retention",
          content: (
            <>
              <PolicyP>
                We retain your personal data only for as long as necessary:
              </PolicyP>
              <PolicyList
                items={[
                  "Order and transaction data: 7 years (for legal/accounting compliance under Pakistani law)",
                  "Account data: as long as your account is active, plus 1 year after deletion request",
                  "Marketing preferences and email lists: until you unsubscribe",
                  "Contact form submissions: 2 years",
                  "Server and access logs: 90 days",
                ]}
              />
            </>
          ),
        },
        {
          id:    "your-rights",
          title: "Your Rights",
          content: (
            <>
              <PolicyP>You have the following rights regarding your personal data:</PolicyP>
              <PolicyList
                items={[
                  "Access — request a copy of the personal data we hold about you",
                  "Correction — ask us to correct inaccurate or incomplete data",
                  "Deletion — request that we delete your personal data (subject to legal retention obligations)",
                  "Unsubscribe — opt out of marketing emails at any time via the unsubscribe link or by contacting us",
                  "Portability — receive your data in a structured, machine-readable format",
                ]}
              />
              <PolicyP>
                To exercise any of these rights, contact us at the details below. We will respond within 30 days.
              </PolicyP>
              <PolicyContactBox
                phone="+92 300 0000000"
                email="privacy@nayabposh.com"
                hours="Mon – Sat, 10:00 AM – 6:00 PM PKT"
              />
            </>
          ),
        },
        {
          id:    "security",
          title: "Data Security",
          content: (
            <>
              <PolicyP>
                We take the security of your personal data seriously. We implement appropriate technical and organisational measures including:
              </PolicyP>
              <PolicyList
                items={[
                  "HTTPS encryption for all data transmitted to and from our website",
                  "Secure, hashed password storage — we never store passwords in plain text",
                  "Access controls limiting who within our team can access customer data",
                  "Regular security reviews of third-party service providers",
                ]}
              />
              <PolicyP>
                Despite these measures, no internet transmission is 100% secure. If you believe your data has been compromised, please contact us immediately.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "changes",
          title: "Changes to This Policy",
          content: (
            <>
              <PolicyP>
                We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via email (if you have an account) or by displaying a notice on our website.
              </PolicyP>
              <PolicyP>
                The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised. We encourage you to review this page periodically.
              </PolicyP>
            </>
          ),
        },
      ]}
    />
  );
}
