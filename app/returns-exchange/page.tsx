import PolicyLayout, {
  PolicyP,
  PolicyList,
  PolicySteps,
  PolicyCallout,
  PolicyContactBox,
} from "@/components/policy/PolicyLayout";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title:       "Returns & Exchange Policy",
  description: "Learn about Nayab Posh's exchange policy — 7-day hassle-free exchanges on unworn, unwashed items with tags attached.",
  path:        "/returns-exchange",
});

export default function ReturnsExchangePage() {
  return (
    <PolicyLayout
      badge="Customer Care"
      title="Returns & Exchange Policy"
      description="We want you to love every piece you receive. If something isn't quite right, we're here to help — read our straightforward exchange guidelines below."
      lastUpdated="June 2026"
      sections={[
        {
          id:    "overview",
          title: "Our Exchange Policy",
          content: (
            <>
              <PolicyCallout>
                Nayab Posh currently offers exchanges only. We do not process monetary refunds. All eligible items may be exchanged for a different size, colour, or style of equal or greater value.
              </PolicyCallout>
              <PolicyP>
                We take pride in the quality of every piece we create. If you receive an item that doesn't fit or isn't the right style for you, we&apos;re happy to arrange an exchange — provided the item meets our exchange conditions.
              </PolicyP>
              <PolicyP>
                Exchange requests must be raised within 7 days of the delivery date. Requests submitted after this window cannot be processed.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "eligibility",
          title: "Eligibility Conditions",
          content: (
            <>
              <PolicyP>
                To qualify for an exchange, the item must meet all of the following conditions:
              </PolicyP>
              <PolicyList
                items={[
                  "Returned within 7 calendar days of the delivery date",
                  "Unworn and unwashed — no visible use, stains, or odour",
                  "All original tags and labels still attached and intact",
                  "In the original packaging (garment bag, tissue, or branded box)",
                  "Accompanied by the original order number or packing slip",
                ]}
              />
              <PolicyP>
                Items that do not meet the above conditions will be returned to you at your cost without processing an exchange.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "non-exchangeable",
          title: "Non-Exchangeable Items",
          content: (
            <>
              <PolicyP>The following items are final sale and cannot be exchanged:</PolicyP>
              <PolicyList
                items={[
                  "Sale or discounted items purchased during promotional events",
                  "Innerwear, undergarments, or intimate apparel (hygiene reasons)",
                  "Accessories (jewellery, belts, scarves) once removed from original packaging",
                  "Custom-made, personalised, or made-to-measure orders",
                  "Items purchased as part of a gift set where any piece has been used",
                ]}
              />
            </>
          ),
        },
        {
          id:    "process",
          title: "How to Request an Exchange",
          content: (
            <>
              <PolicySteps
                steps={[
                  {
                    title:       "Contact us within 7 days",
                    description: "Message us on WhatsApp or email us with your order number, the item you wish to exchange, and the reason for exchange.",
                  },
                  {
                    title:       "Receive an Exchange Request Number (ERN)",
                    description: "Our team will review your request within 24 hours on business days and issue a unique ERN if your item qualifies.",
                  },
                  {
                    title:       "Ship the item back to us",
                    description: "Carefully pack the item with all original packaging and write your ERN clearly on the parcel. Ship to our Lahore address using a tracked courier service. Return shipping costs are borne by the customer.",
                  },
                  {
                    title:       "We inspect and process your exchange",
                    description: "Upon receiving and inspecting the parcel (1–2 business days), we will confirm the exchange and dispatch your replacement item.",
                  },
                  {
                    title:       "Receive your new item",
                    description: "Your exchanged item will be dispatched within 2 business days of receiving your return, with delivery taking a further 3–5 business days.",
                  },
                ]}
              />
              <PolicyContactBox
                phone="+92 300 0000000"
                email="care@nayabposh.com"
                hours="Mon – Sat, 10:00 AM – 6:00 PM PKT"
              />
            </>
          ),
        },
        {
          id:    "shipping-costs",
          title: "Shipping Costs for Exchanges",
          content: (
            <>
              <PolicyP>
                The cost of returning the original item to us is the customer&apos;s responsibility. We cover the shipping cost of sending the replacement item back to you.
              </PolicyP>
              <PolicyP>
                We strongly recommend using a tracked courier service (e.g. TCS, Leopards, BlueEx) when sending items back. Nayab Posh is not responsible for items lost or damaged in transit during a return shipment.
              </PolicyP>
              <PolicyCallout>
                If your item arrived damaged, defective, or incorrect, we will cover both the return shipping and the replacement shipping at no cost to you.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "damaged-items",
          title: "Damaged or Incorrect Items",
          content: (
            <>
              <PolicyP>
                In the rare event that you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with:
              </PolicyP>
              <PolicyList
                items={[
                  "Your order number",
                  "A clear photograph of the issue (packaging and item)",
                  "A brief description of the problem",
                ]}
              />
              <PolicyP>
                We will arrange a free collection and replacement at the earliest opportunity. Damaged or incorrect item claims raised after 48 hours may not be accepted.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "contact",
          title: "Questions About Your Exchange",
          content: (
            <>
              <PolicyP>
                Our customer care team is here to make the process as smooth as possible. Reach out via WhatsApp for the fastest response — most queries are resolved within a few hours during business days.
              </PolicyP>
              <PolicyContactBox
                phone="+92 300 0000000"
                email="care@nayabposh.com"
                hours="Mon – Sat, 10:00 AM – 6:00 PM PKT"
              />
            </>
          ),
        },
      ]}
    />
  );
}
