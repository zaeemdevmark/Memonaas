import {
  Html, Head, Body, Preview, Container, Section,
  Heading, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";
import type { OrderDTO } from "@/lib/types/order";

// ── Helpers ────────────────────────────────────────────────────────────────

function fp(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = {
  body:       { backgroundColor: "#f5f5f0", margin: 0, padding: "40px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  container:  { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" },
  header:     { backgroundColor: "#0a0a0a", padding: "32px 40px", textAlign: "center" as const },
  brand:      { color: "#ffffff", fontSize: "18px", letterSpacing: "0.35em", textTransform: "uppercase" as const, fontWeight: "300", margin: "0" },
  tagline:    { color: "#8a8a8a", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" as const, margin: "6px 0 0" },
  body2:      { padding: "40px" },
  h1:         { color: "#0a0a0a", fontSize: "24px", fontWeight: "300", letterSpacing: "0.05em", margin: "0 0 8px" },
  subtitle:   { color: "#6b6b6b", fontSize: "13px", margin: "0 0 32px", lineHeight: "1.5" },
  meta:       { backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px 20px", marginBottom: "32px" },
  metaRow:    { margin: "0" },
  metaLabel:  { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 2px" },
  metaValue:  { color: "#0a0a0a", fontSize: "14px", fontWeight: "600", margin: "0" },
  sectionHead:{ color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 12px", fontWeight: "600" },
  tableHead:  { backgroundColor: "#fafafa", borderBottom: "1px solid #e8e8e8" },
  thText:     { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const, fontWeight: "500", padding: "8px 0", margin: "0" },
  tdProduct:  { color: "#0a0a0a", fontSize: "13px", fontWeight: "500", padding: "14px 0 4px", margin: "0" },
  tdMeta:     { color: "#9a9a9a", fontSize: "11px", padding: "0 0 14px", margin: "0" },
  tdRight:    { color: "#0a0a0a", fontSize: "13px", textAlign: "right" as const, padding: "14px 0", margin: "0" },
  divider:    { border: "none", borderTop: "1px solid #e8e8e8", margin: "24px 0" },
  totalRow:   { margin: "6px 0" },
  totalLabel: { color: "#6b6b6b", fontSize: "12px", margin: "0" },
  totalValue: { color: "#0a0a0a", fontSize: "12px", textAlign: "right" as const, margin: "0" },
  grandLabel: { color: "#0a0a0a", fontSize: "14px", fontWeight: "700", margin: "0" },
  grandValue: { color: "#0a0a0a", fontSize: "14px", fontWeight: "700", textAlign: "right" as const, margin: "0" },
  addrText:   { color: "#3a3a3a", fontSize: "13px", lineHeight: "1.7", margin: "0" },
  codBox:     { backgroundColor: "#fffdf5", border: "1px solid #f0e68c", padding: "14px 18px", marginTop: "24px" },
  codText:    { color: "#7a6a00", fontSize: "12px", margin: "0", lineHeight: "1.6" },
  footer:     { backgroundColor: "#fafafa", borderTop: "1px solid #e8e8e8", padding: "24px 40px", textAlign: "center" as const },
  footerText: { color: "#9a9a9a", fontSize: "11px", margin: "0 0 4px", lineHeight: "1.6" },
};

// ── Template ───────────────────────────────────────────────────────────────

interface Props { order: OrderDTO }

export default function OrderConfirmationEmail({ order }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Memonaas order {order.orderNumber} is confirmed.</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Header */}
          <Section style={s.header}>
            <Text style={s.brand}>Memonaas</Text>
            <Text style={s.tagline}>Luxury Fashion</Text>
          </Section>

          {/* Body */}
          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>Order Confirmed</Heading>
            <Text style={s.subtitle}>
              Thank you for your purchase, {order.shipping.name.split(" ")[0]}. Your order has been received
              and our team will be in touch to confirm delivery.
            </Text>

            {/* Order meta */}
            <Section style={s.meta}>
              <Row>
                <Column style={{ width: "50%", paddingRight: "12px" }}>
                  <Text style={s.metaLabel}>Order Number</Text>
                  <Text style={s.metaValue}>{order.orderNumber}</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={s.metaLabel}>Order Date</Text>
                  <Text style={s.metaValue}>{fmtDate(order.createdAt)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Items */}
            <Text style={s.sectionHead}>Items Ordered</Text>
            <Section style={s.tableHead}>
              <Row>
                <Column style={{ width: "60%" }}><Text style={s.thText}>Product</Text></Column>
                <Column style={{ width: "20%" }}><Text style={{ ...s.thText, textAlign: "center" }}>Qty</Text></Column>
                <Column style={{ width: "20%" }}><Text style={{ ...s.thText, textAlign: "right" }}>Price</Text></Column>
              </Row>
            </Section>
            {order.items.map((item) => (
              <Row key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <Column style={{ width: "60%" }}>
                  <Text style={s.tdProduct}>{item.productName}</Text>
                  <Text style={s.tdMeta}>{item.size} / {item.color}</Text>
                </Column>
                <Column style={{ width: "20%" }}>
                  <Text style={{ ...s.tdRight, textAlign: "center" }}>{item.quantity}</Text>
                </Column>
                <Column style={{ width: "20%" }}>
                  <Text style={s.tdRight}>{fp(item.lineTotal)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={s.divider} />

            {/* Totals */}
            {order.discountAmount > 0 && (
              <Row style={s.totalRow}>
                <Column><Text style={s.totalLabel}>Discount</Text></Column>
                <Column><Text style={s.totalValue}>−{fp(order.discountAmount)}</Text></Column>
              </Row>
            )}
            <Row style={s.totalRow}>
              <Column><Text style={s.totalLabel}>Shipping</Text></Column>
              <Column>
                <Text style={s.totalValue}>
                  {order.shippingCost === 0 ? "Free" : fp(order.shippingCost)}
                </Text>
              </Column>
            </Row>
            <Hr style={{ ...s.divider, margin: "12px 0" }} />
            <Row>
              <Column><Text style={s.grandLabel}>Total</Text></Column>
              <Column><Text style={s.grandValue}>{fp(order.total)}</Text></Column>
            </Row>

            <Hr style={s.divider} />

            {/* Shipping address */}
            <Text style={s.sectionHead}>Delivery Address</Text>
            <Text style={s.addrText}>
              {order.shipping.name}<br />
              {order.shipping.phone}<br />
              {order.shipping.street}<br />
              {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}<br />
              {order.shipping.country}
            </Text>

            {/* COD notice */}
            {order.payment?.method === "COD" && (
              <Section style={s.codBox}>
                <Text style={s.codText}>
                  <strong>Cash on Delivery</strong> — Please have the exact amount of{" "}
                  <strong>{fp(order.total)}</strong> ready when your order arrives.
                  Our courier will collect payment upon delivery.
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={s.footer}>
            <Text style={s.footerText}>Memonaas — Luxury Fashion</Text>
            <Text style={s.footerText}>Questions? Reply to this email or contact our support team.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
