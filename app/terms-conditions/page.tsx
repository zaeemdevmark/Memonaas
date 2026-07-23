import PolicyLayout, {
  PolicyP,
  PolicyList,
  PolicyCallout,
  PolicyContactBox,
} from "@/components/policy/PolicyLayout";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title:       "Terms & Conditions",
  description: "Read the terms and conditions governing your use of the Memonaas website and purchases made through our platform.",
  path:        "/terms-conditions",
});

export default function TermsConditionsPage() {
  return (
    <PolicyLayout
      badge="Legal"
      title="Terms & Conditions"
      description={`By accessing or placing an order on ${SITE_NAME}, you agree to be bound by these Terms and Conditions. Please read them carefully before using our website.`}
      lastUpdated="June 2026"
      sections={[
        {
          id:    "acceptance",
          title: "Acceptance of Terms",
          content: (
            <>
              <PolicyP>
                By visiting, browsing, or making a purchase on memonaas.com, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy and any other policies referenced herein.
              </PolicyP>
              <PolicyP>
                If you do not agree to these terms, please refrain from using our website or placing any orders.
              </PolicyP>
              <PolicyCallout>
                These terms apply to all users of the website, including browsers, customers, vendors, and anyone contributing content.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "eligibility",
          title: "Eligibility",
          content: (
            <>
              <PolicyP>
                By using this website, you represent that:
              </PolicyP>
              <PolicyList
                items={[
                  "You are at least 18 years of age, or using the site under the supervision of a parent or guardian",
                  "You are a resident of Pakistan or are placing an order to a Pakistani delivery address",
                  "You are not placing orders for commercial resale without prior written consent from Memonaas",
                  "The information you provide is accurate, current, and complete",
                ]}
              />
            </>
          ),
        },
        {
          id:    "orders",
          title: "Orders & Acceptance",
          content: (
            <>
              <PolicyP>
                Placing an order on our website constitutes an offer to purchase. An order is only accepted once we send you a written order confirmation via email or SMS. We reserve the right to refuse or cancel any order at any time.
              </PolicyP>
              <PolicyP>
                Reasons we may cancel an order include (but are not limited to):
              </PolicyP>
              <PolicyList
                items={[
                  "The item is out of stock or no longer available",
                  "We identify an error in the product description or price",
                  "We are unable to verify the delivery address",
                  "The order appears fraudulent or unusual",
                ]}
              />
              <PolicyP>
                In the event we cancel a pre-paid order, a full refund will be issued to the original payment method within 5–7 business days.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "pricing",
          title: "Pricing & Product Descriptions",
          content: (
            <>
              <PolicyP>
                All prices displayed on the website are in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless otherwise stated. Prices are subject to change without notice.
              </PolicyP>
              <PolicyP>
                We make every effort to ensure product descriptions, images, sizes, and colours are accurate. However, minor variations in colour may occur due to differences in screen calibration and display settings. Such variations do not constitute a defect.
              </PolicyP>
              <PolicyCallout>
                In the event of a pricing error, we reserve the right to correct the price and inform you before fulfilling the order. You may then choose to proceed at the corrected price or cancel.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "payment",
          title: "Payment",
          content: (
            <>
              <PolicyP>We accept the following payment methods:</PolicyP>
              <PolicyList
                items={[
                  "Cash on Delivery (COD) — available for orders up to Rs. 25,000",
                  "Advance bank transfer — for orders above Rs. 25,000 or where COD is unavailable in your area",
                  "Mobile wallets (EasyPaisa / JazzCash)",
                ]}
              />
              <PolicyP>
                For COD orders, payment is due in full at the time of delivery. Refusing a COD delivery without prior notification may result in your account being flagged for future orders.
              </PolicyP>
              <PolicyP>
                Memonaas does not store your bank or card details. Any payment data is processed directly by our payment partners.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "exchanges-returns",
          title: "Exchanges & Returns",
          content: (
            <>
              <PolicyP>
                Our exchange and return policy is governed by our{" "}
                <a href="/returns-exchange" className="text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity">
                  Returns & Exchange Policy
                </a>{" "}
                page, which forms part of these Terms and Conditions.
              </PolicyP>
              <PolicyCallout>
                We operate an exchange-only policy. We do not offer monetary refunds except in cases where we are required by law, or where an item is found to be materially defective or incorrectly described.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "intellectual-property",
          title: "Intellectual Property",
          content: (
            <>
              <PolicyP>
                All content on this website — including but not limited to text, images, graphics, logos, product photographs, and design elements — is the exclusive property of Memonaas or its licensors and is protected by Pakistani and international copyright law.
              </PolicyP>
              <PolicyP>
                You may not reproduce, distribute, display, publish, or create derivative works from any content on this site without our prior written permission.
              </PolicyP>
              <PolicyList
                items={[
                  "You may not use our brand name, logo, or product images without permission",
                  "Screenshots for personal use or genuine reviews are permitted",
                  "Unauthorised commercial use of our content will result in legal action",
                ]}
              />
            </>
          ),
        },
        {
          id:    "liability",
          title: "Limitation of Liability",
          content: (
            <>
              <PolicyP>
                To the fullest extent permitted by applicable law, Memonaas shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products.
              </PolicyP>
              <PolicyP>
                Our total liability to you for any claim arising from a purchase or use of our website shall not exceed the total amount paid by you for the order in question.
              </PolicyP>
              <PolicyP>
                We do not accept liability for delays caused by courier partners, acts of God, force majeure events, or circumstances outside our reasonable control.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "governing-law",
          title: "Governing Law",
          content: (
            <>
              <PolicyP>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan.
              </PolicyP>
              <PolicyP>
                Any disputes arising from or in connection with these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts of Lahore, Punjab, Pakistan.
              </PolicyP>
              <PolicyP>
                We will, however, always attempt to resolve disputes amicably before any legal proceedings are initiated. Please contact us first.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "amendments",
          title: "Amendments to Terms",
          content: (
            <>
              <PolicyP>
                We reserve the right to modify these Terms and Conditions at any time. Changes take effect immediately upon posting to this page. The &quot;Last updated&quot; date at the top of this page will reflect the most recent revision.
              </PolicyP>
              <PolicyP>
                Your continued use of our website after any changes constitutes your acceptance of the updated terms. We encourage you to review this page periodically.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "contact",
          title: "Contact Us",
          content: (
            <>
              <PolicyP>
                If you have any questions about these Terms and Conditions, please reach out to us:
              </PolicyP>
              <PolicyContactBox
                phone="+92 304 6665494"
                email="care@memonaas.com"
                hours="Mon – Sat, 10:00 AM – 6:00 PM PKT"
              />
            </>
          ),
        },
      ]}
    />
  );
}
