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
  hero:      { backgroundColor: "#f0f7f0", padding: "32px 40px", textAlign: "center" as const },
  heroIcon:  { color: "#2d7a2d", fontSize: "36px", margin: "0 0 12px" },
  heroLabel: { color: "#2d7a2d", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, fontWeight: "600", margin: "0" },
  body2:     { padding: "40px" },
  h1:        { color: "#0a0a0a", fontSize: "24px", fontWeight: "300", margin: "0 0 8px" },
  lead:      { color: "#6b6b6b", fontSize: "13px", margin: "0 0 32px", lineHeight: "1.6" },
  metaBox:   { backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "16px 20px", marginBottom: "32px" },
  metaLabel: { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 2px" },
  metaValue: { color: "#0a0a0a", fontSize: "14px", fontWeight: "600", margin: "0" },
  secHead:   { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 12px", fontWeight: "600" },
  itemRow:   { borderBottom: "1px solid #f0f0f0" },
  itemName:  { color: "#0a0a0a", fontSize: "13px", fontWeight: "500", padding: "12px 0 3px", margin: "0" },
  itemMeta:  { color: "#9a9a9a", fontSize: "11px", padding: "0 0 12px", margin: "0" },
  itemPrice: { color: "#0a0a0a", fontSize: "13px", textAlign: "right" as const, padding: "12px 0", margin: "0" },
  divider:   { border: "none", borderTop: "1px solid #e8e8e8", margin: "24px 0" },
  addrLabel: { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 8px", fontWeight: "600" },
  addrText:  { color: "#3a3a3a", fontSize: "13px", lineHeight: "1.7", margin: "0" },
  codBox:    { backgroundColor: "#fffdf5", border: "1px solid #f0e68c", padding: "14px 18px", marginTop: "24px" },
  codText:   { color: "#7a6a00", fontSize: "12px", margin: "0", lineHeight: "1.6" },
  footer:    { backgroundColor: "#fafafa", borderTop: "1px solid #e8e8e8", padding: "24px 40px", textAlign: "center" as const },
  footerTxt: { color: "#9a9a9a", fontSize: "11px", margin: "0 0 4px", lineHeight: "1.6" },
};

interface Props { order: OrderDTO }

export default function ShippingUpdateEmail({ order }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Great news — your Memonaas order {order.orderNumber} is on its way!</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          <Section style={s.header}>
            <Text style={s.brand}>Memonaas</Text>
            <Text style={s.tagline}>Luxury Fashion</Text>
          </Section>

          <Section style={s.hero}>
            <Text style={s.heroIcon}>📦</Text>
            <Text style={s.heroLabel}>Your order is on its way</Text>
          </Section>

          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>It&apos;s been shipped!</Heading>
            <Text style={s.lead}>
              Hi {order.shipping.name.split(" ")[0]}, your order has been dispatched and is now
              on its way to you. Our courier will deliver to your address and collect payment on arrival.
            </Text>

            <Section style={s.metaBox}>
              <Row>
                <Column style={{ width: "50%", paddingRight: "12px" }}>
                  <Text style={s.metaLabel}>Order Number</Text>
                  <Text style={s.metaValue}>{order.orderNumber}</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={s.metaLabel}>Shipped Date</Text>
                  <Text style={s.metaValue}>{fmtDate(new Date().toISOString())}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={s.secHead}>Items in this Shipment</Text>
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

            <Text style={s.addrLabel}>Delivery Address</Text>
            <Text style={s.addrText}>
              {order.shipping.name}<br />
              {order.shipping.street}<br />
              {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}<br />
              {order.shipping.country}
            </Text>

            {order.payment?.method === "COD" && (
              <Section style={s.codBox}>
                <Text style={s.codText}>
                  <strong>Reminder:</strong> Please have <strong>{fp(order.total)}</strong> in cash ready
                  for the courier. Payment is collected upon delivery.
                </Text>
              </Section>
            )}
          </Section>

          <Section style={s.footer}>
            <Text style={s.footerTxt}>Memonaas — Luxury Fashion</Text>
            <Text style={s.footerTxt}>Questions about your delivery? Reply to this email.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
