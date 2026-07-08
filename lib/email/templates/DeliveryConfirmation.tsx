import {
  Html, Head, Body, Preview, Container, Section,
  Heading, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";
import type { OrderDTO } from "@/lib/types/order";

function fp(n: number) { return `Rs. ${n.toLocaleString("en-PK")}`; }

const s = {
  body:      { backgroundColor: "#f5f5f0", margin: 0, padding: "40px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" },
  header:    { backgroundColor: "#0a0a0a", padding: "32px 40px", textAlign: "center" as const },
  brand:     { color: "#ffffff", fontSize: "18px", letterSpacing: "0.35em", textTransform: "uppercase" as const, fontWeight: "300", margin: "0" },
  tagline:   { color: "#8a8a8a", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" as const, margin: "6px 0 0" },
  hero:      { backgroundColor: "#f0f7f0", padding: "36px 40px", textAlign: "center" as const },
  heroIcon:  { color: "#2d7a2d", fontSize: "40px", margin: "0 0 10px" },
  heroLabel: { color: "#2d7a2d", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, fontWeight: "600", margin: "0" },
  body2:     { padding: "40px" },
  h1:        { color: "#0a0a0a", fontSize: "24px", fontWeight: "300", margin: "0 0 8px" },
  lead:      { color: "#6b6b6b", fontSize: "13px", margin: "0 0 32px", lineHeight: "1.6" },
  secHead:   { color: "#9a9a9a", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "0 0 12px", fontWeight: "600" },
  itemRow:   { borderBottom: "1px solid #f0f0f0" },
  itemName:  { color: "#0a0a0a", fontSize: "13px", fontWeight: "500", padding: "12px 0 3px", margin: "0" },
  itemMeta:  { color: "#9a9a9a", fontSize: "11px", padding: "0 0 12px", margin: "0" },
  itemPrice: { color: "#0a0a0a", fontSize: "13px", textAlign: "right" as const, padding: "12px 0", margin: "0" },
  divider:   { border: "none", borderTop: "1px solid #e8e8e8", margin: "24px 0" },
  totalRow:  { margin: "6px 0" },
  totalLbl:  { color: "#6b6b6b", fontSize: "12px", margin: "0" },
  totalVal:  { color: "#0a0a0a", fontSize: "12px", textAlign: "right" as const, margin: "0" },
  grandLbl:  { color: "#0a0a0a", fontSize: "14px", fontWeight: "700", margin: "0" },
  grandVal:  { color: "#0a0a0a", fontSize: "14px", fontWeight: "700", textAlign: "right" as const, margin: "0" },
  thankBox:  { backgroundColor: "#fafafa", border: "1px solid #e8e8e8", padding: "20px 24px", marginTop: "24px" },
  thankText: { color: "#3a3a3a", fontSize: "13px", margin: "0", lineHeight: "1.7" },
  footer:    { backgroundColor: "#fafafa", borderTop: "1px solid #e8e8e8", padding: "24px 40px", textAlign: "center" as const },
  footerTxt: { color: "#9a9a9a", fontSize: "11px", margin: "0 0 4px", lineHeight: "1.6" },
};

interface Props { order: OrderDTO }

export default function DeliveryConfirmationEmail({ order }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Memonaas order {order.orderNumber} has been delivered. We hope you love it!</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          <Section style={s.header}>
            <Text style={s.brand}>Memonaas</Text>
            <Text style={s.tagline}>Luxury Fashion</Text>
          </Section>

          <Section style={s.hero}>
            <Text style={s.heroIcon}>✓</Text>
            <Text style={s.heroLabel}>Order Delivered</Text>
          </Section>

          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>Your order has arrived!</Heading>
            <Text style={s.lead}>
              Hi {order.shipping.name.split(" ")[0]}, we&apos;re delighted to confirm that your order{" "}
              <strong>{order.orderNumber}</strong> has been delivered successfully.
              We hope you love your Memonaas pieces.
            </Text>

            <Text style={s.secHead}>Your Order</Text>
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

            <Row style={s.totalRow}>
              <Column><Text style={s.totalLbl}>Subtotal</Text></Column>
              <Column><Text style={s.totalVal}>{fp(order.subtotal)}</Text></Column>
            </Row>
            {order.discountAmount > 0 && (
              <Row style={s.totalRow}>
                <Column><Text style={s.totalLbl}>Discount</Text></Column>
                <Column><Text style={s.totalVal}>−{fp(order.discountAmount)}</Text></Column>
              </Row>
            )}
            <Row style={s.totalRow}>
              <Column><Text style={s.totalLbl}>Shipping</Text></Column>
              <Column><Text style={s.totalVal}>{order.shippingCost === 0 ? "Free" : fp(order.shippingCost)}</Text></Column>
            </Row>
            <Hr style={{ ...s.divider, margin: "12px 0" }} />
            <Row>
              <Column><Text style={s.grandLbl}>Total Paid</Text></Column>
              <Column><Text style={s.grandVal}>{fp(order.total)}</Text></Column>
            </Row>

            <Section style={s.thankBox}>
              <Text style={s.thankText}>
                Thank you for choosing Memonaas. If you have any concerns about your order or would like to
                share feedback, please reply to this email — we&apos;d love to hear from you.
              </Text>
            </Section>
          </Section>

          <Section style={s.footer}>
            <Text style={s.footerTxt}>Memonaas — Luxury Fashion</Text>
            <Text style={s.footerTxt}>Thank you for shopping with us.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
