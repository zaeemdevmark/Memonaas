import {
  Html, Head, Body, Preview, Container, Section,
  Heading, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";
import type { OrderDTO } from "@/lib/types/order";

function fp(n: number) { return `Rs. ${n.toLocaleString("en-PK")}`; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const s = {
  body:      { backgroundColor: "#f0f0f0", margin: 0, padding: "32px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" },
  header:    { backgroundColor: "#1a1a2e", padding: "24px 32px" },
  brand:     { color: "#ffffff", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase" as const, fontWeight: "600", margin: "0 0 4px" },
  subtitle:  { color: "#8888aa", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0" },
  alertBar:  { backgroundColor: "#2563eb", padding: "12px 32px" },
  alertText: { color: "#ffffff", fontSize: "13px", fontWeight: "600", margin: "0", letterSpacing: "0.05em" },
  body2:     { padding: "32px" },
  h1:        { color: "#111827", fontSize: "22px", fontWeight: "700", margin: "0 0 4px" },
  orderNum:  { color: "#6b7280", fontSize: "13px", fontFamily: "monospace", margin: "0 0 24px" },
  metaGrid:  { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "28px" },
  metaLabel: { color: "#9ca3af", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 2px" },
  metaValue: { color: "#111827", fontSize: "14px", fontWeight: "600", margin: "0" },
  secHead:   { color: "#6b7280", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 10px", fontWeight: "600" },
  tableHead: { backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" },
  thTxt:     { color: "#9ca3af", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "8px 0", margin: "0", fontWeight: "500" },
  tdName:    { color: "#111827", fontSize: "13px", fontWeight: "500", padding: "12px 0 3px", margin: "0" },
  tdMeta:    { color: "#9ca3af", fontSize: "11px", padding: "0 0 12px", margin: "0" },
  tdRight:   { color: "#111827", fontSize: "13px", textAlign: "right" as const, padding: "12px 0", margin: "0" },
  divider:   { border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" },
  totalRow:  { margin: "5px 0" },
  totalLbl:  { color: "#6b7280", fontSize: "12px", margin: "0" },
  totalVal:  { color: "#111827", fontSize: "12px", textAlign: "right" as const, margin: "0" },
  grandLbl:  { color: "#111827", fontSize: "15px", fontWeight: "700", margin: "0" },
  grandVal:  { color: "#1d4ed8", fontSize: "15px", fontWeight: "700", textAlign: "right" as const, margin: "0" },
  custBox:   { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "20px" },
  custLine:  { color: "#374151", fontSize: "13px", margin: "0 0 6px", lineHeight: "1.5" },
  addrText:  { color: "#374151", fontSize: "13px", lineHeight: "1.7", margin: "0" },
  payBox:    { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 16px", marginTop: "20px" },
  payText:   { color: "#1e40af", fontSize: "12px", margin: "0", lineHeight: "1.6" },
  footer:    { backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "20px 32px", textAlign: "center" as const },
  footerTxt: { color: "#9ca3af", fontSize: "11px", margin: "0 0 4px" },
};

interface Props { order: OrderDTO }

export default function NewOrderAdminEmail({ order }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New order {order.orderNumber} — {fp(order.total)} from {order.shipping.name}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          <Section style={s.header}>
            <Text style={s.brand}>Nayab Posh</Text>
            <Text style={s.subtitle}>Admin Notification</Text>
          </Section>

          <Section style={s.alertBar}>
            <Text style={s.alertText}>🛒 New Order Received</Text>
          </Section>

          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>Order {order.orderNumber}</Heading>
            <Text style={s.orderNum}>Placed on {fmtDate(order.createdAt)}</Text>

            {/* Key metrics */}
            <Section style={s.metaGrid}>
              <Row>
                <Column style={{ width: "33%", paddingRight: "8px" }}>
                  <Text style={s.metaLabel}>Total</Text>
                  <Text style={s.metaValue}>{fp(order.total)}</Text>
                </Column>
                <Column style={{ width: "33%", paddingRight: "8px" }}>
                  <Text style={s.metaLabel}>Items</Text>
                  <Text style={s.metaValue}>{order.items.reduce((s, i) => s + i.quantity, 0)}</Text>
                </Column>
                <Column style={{ width: "34%" }}>
                  <Text style={s.metaLabel}>Payment</Text>
                  <Text style={s.metaValue}>{order.payment?.method ?? "—"}</Text>
                </Column>
              </Row>
            </Section>

            {/* Items table */}
            <Text style={s.secHead}>Order Items</Text>
            <Section style={s.tableHead}>
              <Row>
                <Column style={{ width: "55%" }}><Text style={s.thTxt}>Product</Text></Column>
                <Column style={{ width: "20%" }}><Text style={{ ...s.thTxt, textAlign: "center" }}>Qty</Text></Column>
                <Column style={{ width: "25%" }}><Text style={{ ...s.thTxt, textAlign: "right" }}>Total</Text></Column>
              </Row>
            </Section>
            {order.items.map((item) => (
              <Row key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <Column style={{ width: "55%" }}>
                  <Text style={s.tdName}>{item.productName}</Text>
                  <Text style={s.tdMeta}>{item.size} / {item.color}</Text>
                </Column>
                <Column style={{ width: "20%" }}>
                  <Text style={{ ...s.tdRight, textAlign: "center" }}>{item.quantity}</Text>
                </Column>
                <Column style={{ width: "25%" }}>
                  <Text style={s.tdRight}>{fp(item.lineTotal)}</Text>
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
            <Hr style={{ ...s.divider, margin: "10px 0" }} />
            <Row>
              <Column><Text style={s.grandLbl}>Total</Text></Column>
              <Column><Text style={s.grandVal}>{fp(order.total)}</Text></Column>
            </Row>

            <Hr style={s.divider} />

            {/* Customer */}
            <Text style={s.secHead}>Customer</Text>
            <Section style={s.custBox}>
              <Text style={s.custLine}><strong>{order.shipping.name}</strong></Text>
              {order.shipping.email && (
                <Text style={s.custLine}>📧 {order.shipping.email}</Text>
              )}
              <Text style={s.custLine}>📞 {order.shipping.phone}</Text>
            </Section>

            {/* Delivery */}
            <Text style={s.secHead}>Delivery Address</Text>
            <Text style={s.addrText}>
              {order.shipping.street}<br />
              {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}<br />
              {order.shipping.country}
            </Text>

            {order.notes && (
              <>
                <Hr style={s.divider} />
                <Text style={s.secHead}>Customer Note</Text>
                <Text style={{ ...s.addrText, color: "#6b7280", fontStyle: "italic" }}>{order.notes}</Text>
              </>
            )}

            {order.payment?.method === "COD" && (
              <Section style={s.payBox}>
                <Text style={s.payText}>
                  <strong>COD Order</strong> — Collect <strong>{fp(order.total)}</strong> in cash upon delivery.
                  Payment status is currently <strong>Pending</strong>.
                </Text>
              </Section>
            )}
          </Section>

          <Section style={s.footer}>
            <Text style={s.footerTxt}>Nayab Posh Admin Notifications</Text>
            <Text style={s.footerTxt}>Log in to the admin panel to manage this order.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
