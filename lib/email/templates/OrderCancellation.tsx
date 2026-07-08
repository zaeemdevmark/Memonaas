import {
  Html, Head, Body, Preview, Container, Section,
  Heading, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";
import type { OrderDTO } from "@/lib/types/order";

function fp(n: number) { return `Rs. ${n.toLocaleString("en-PK")}`; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const s = {
  body:      { backgroundColor: "#f5f5f0", margin: 0, padding: "40px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" },
  header:    { backgroundColor: "#0a0a0a", padding: "32px 40px", textAlign: "center" as const },
  brand:     { color: "#ffffff", fontSize: "18px", letterSpacing: "0.35em", textTransform: "uppercase" as const, fontWeight: "300", margin: "0" },
  tagline:   { color: "#8a8a8a", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" as const, margin: "6px 0 0" },
  hero:      { backgroundColor: "#fff5f5", padding: "32px 40px", textAlign: "center" as const },
  heroIcon:  { color: "#c0392b", fontSize: "36px", margin: "0 0 10px" },
  heroLabel: { color: "#c0392b", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, fontWeight: "600", margin: "0" },
  body2:     { padding: "40px" },
  h1:        { color: "#0a0a0a", fontSize: "24px", fontWeight: "300", margin: "0 0 8px" },
  lead:      { color: "#6b6b6b", fontSize: "13px", margin: "0 0 32px", lineHeight: "1.6" },
  metaBox:   { backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px 20px", marginBottom: "32px" },
  metaLabel: { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 2px" },
  metaValue: { color: "#0a0a0a", fontSize: "14px", fontWeight: "600", margin: "0" },
  secHead:   { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 12px", fontWeight: "600" },
  itemRow:   { borderBottom: "1px solid #f0f0f0" },
  itemName:  { color: "#6b6b6b", fontSize: "13px", padding: "12px 0 3px", margin: "0", textDecoration: "line-through" as const },
  itemMeta:  { color: "#b0b0b0", fontSize: "11px", padding: "0 0 12px", margin: "0" },
  itemPrice: { color: "#9a9a9a", fontSize: "13px", textAlign: "right" as const, padding: "12px 0", margin: "0" },
  divider:   { border: "none", borderTop: "1px solid #e8e8e8", margin: "24px 0" },
  infoBox:   { backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "18px 22px", marginTop: "24px" },
  infoText:  { color: "#5a5a5a", fontSize: "12px", margin: "0", lineHeight: "1.7" },
  footer:    { backgroundColor: "#fafafa", borderTop: "1px solid #e8e8e8", padding: "24px 40px", textAlign: "center" as const },
  footerTxt: { color: "#9a9a9a", fontSize: "11px", margin: "0 0 4px", lineHeight: "1.6" },
};

interface Props { order: OrderDTO }

export default function OrderCancellationEmail({ order }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Nayab Posh order {order.orderNumber} has been cancelled.</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          <Section style={s.header}>
            <Text style={s.brand}>Nayab Posh</Text>
            <Text style={s.tagline}>Luxury Fashion</Text>
          </Section>

          <Section style={s.hero}>
            <Text style={s.heroIcon}>✕</Text>
            <Text style={s.heroLabel}>Order Cancelled</Text>
          </Section>

          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>Your order has been cancelled</Heading>
            <Text style={s.lead}>
              Hi {order.shipping.name.split(" ")[0]}, we&apos;re writing to confirm that your order{" "}
              <strong>{order.orderNumber}</strong> placed on {fmtDate(order.createdAt)} has been cancelled.
            </Text>

            <Section style={s.metaBox}>
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

            <Text style={s.secHead}>Cancelled Items</Text>
            {order.items.map((item) => (
              <Row key={item.id} style={s.itemRow}>
                <Column style={{ width: "70%" }}>
                  <Text style={s.itemName}>{item.productName}</Text>
                  <Text style={s.itemMeta}>{item.size} / {item.color} · Qty {item.quantity}</Text>
                </Column>
                <Column style={{ width: "30%" }}>
                  <Text style={s.itemPrice}>{fp(item.lineTotal)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={s.divider} />

            <Section style={s.infoBox}>
              {order.payment?.method === "COD" ? (
                <Text style={s.infoText}>
                  Since this was a <strong>Cash on Delivery</strong> order, no payment was collected.
                  There is nothing further you need to do.
                </Text>
              ) : (
                <Text style={s.infoText}>
                  If any payment was collected, a refund will be processed within 5–7 business days.
                  Please contact us if you have any questions.
                </Text>
              )}
            </Section>

            <Text style={{ ...s.lead, marginTop: "24px", marginBottom: "0" }}>
              We hope to serve you again. If you have any questions about this cancellation, please reply to this email.
            </Text>
          </Section>

          <Section style={s.footer}>
            <Text style={s.footerTxt}>Nayab Posh — Luxury Fashion</Text>
            <Text style={s.footerTxt}>Reply to this email for any assistance.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
