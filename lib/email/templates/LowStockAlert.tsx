import {
  Html, Head, Body, Preview, Container, Section,
  Heading, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";

export interface LowStockItem {
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

interface Props {
  items: LowStockItem[];
  orderId: string;
  orderNumber: string;
}

const s = {
  body:      { backgroundColor: "#f0f0f0", margin: 0, padding: "32px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" },
  header:    { backgroundColor: "#1a1a2e", padding: "24px 32px" },
  brand:     { color: "#ffffff", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase" as const, fontWeight: "600", margin: "0 0 4px" },
  subtitle:  { color: "#8888aa", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0" },
  alertBar:  { backgroundColor: "#dc2626", padding: "12px 32px" },
  alertText: { color: "#ffffff", fontSize: "13px", fontWeight: "600", margin: "0", letterSpacing: "0.05em" },
  body2:     { padding: "32px" },
  h1:        { color: "#111827", fontSize: "20px", fontWeight: "700", margin: "0 0 6px" },
  lead:      { color: "#6b7280", fontSize: "13px", margin: "0 0 24px", lineHeight: "1.6" },
  tableHead: { backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" },
  thTxt:     { color: "#9ca3af", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "8px 0", margin: "0", fontWeight: "500" },
  itemRow:   { borderBottom: "1px solid #f3f4f6" },
  tdName:    { color: "#111827", fontSize: "13px", fontWeight: "500", padding: "12px 0 3px", margin: "0" },
  tdMeta:    { color: "#9ca3af", fontSize: "11px", padding: "0 0 12px", margin: "0" },
  tdCenter:  { color: "#111827", fontSize: "13px", textAlign: "center" as const, padding: "12px 0", margin: "0" },
  stockLow:  { color: "#dc2626", fontSize: "13px", fontWeight: "700", textAlign: "center" as const, padding: "12px 0", margin: "0" },
  divider:   { border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" },
  infoBox:   { backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "14px 18px", marginTop: "8px" },
  infoText:  { color: "#991b1b", fontSize: "12px", margin: "0", lineHeight: "1.7" },
  footer:    { backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "20px 32px", textAlign: "center" as const },
  footerTxt: { color: "#9ca3af", fontSize: "11px", margin: "0 0 4px" },
};

export default function LowStockAlertEmail({ items, orderId, orderNumber }: Props) {
  const plural = items.length !== 1 ? "s" : "";
  const preview = `Low stock alert — ${items.length} variant${plural} need restocking after order ${orderNumber}`;
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          <Section style={s.header}>
            <Text style={s.brand}>Nayab Posh</Text>
            <Text style={s.subtitle}>Admin Notification</Text>
          </Section>

          <Section style={s.alertBar}>
            <Text style={s.alertText}>⚠ Low Stock Alert</Text>
          </Section>

          <Section style={s.body2}>
            <Heading as="h1" style={s.h1}>
              {items.length} variant{items.length !== 1 ? "s" : ""} running low
            </Heading>
            <Text style={s.lead}>
              Order <strong>{orderNumber}</strong> has been shipped. The following product variants
              have fallen below the low-stock threshold and may need to be restocked.
            </Text>

            <Section style={s.tableHead}>
              <Row>
                <Column style={{ width: "50%" }}><Text style={s.thTxt}>Product</Text></Column>
                <Column style={{ width: "25%" }}><Text style={{ ...s.thTxt, textAlign: "center" }}>Variant</Text></Column>
                <Column style={{ width: "25%" }}><Text style={{ ...s.thTxt, textAlign: "center" }}>Stock Left</Text></Column>
              </Row>
            </Section>

            {items.map((item, idx) => (
              <Row key={idx} style={s.itemRow}>
                <Column style={{ width: "50%" }}>
                  <Text style={s.tdName}>{item.productName}</Text>
                  <Text style={s.tdMeta}>{item.sku}</Text>
                </Column>
                <Column style={{ width: "25%" }}>
                  <Text style={s.tdCenter}>{item.size} / {item.color}</Text>
                </Column>
                <Column style={{ width: "25%" }}>
                  <Text style={item.stock === 0 ? { ...s.stockLow } : { ...s.stockLow, color: "#d97706" }}>
                    {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={s.divider} />

            <Section style={s.infoBox}>
              <Text style={s.infoText}>
                Log in to the admin panel to update inventory levels. Items that are out of stock
                will not be purchasable by customers until restocked.
              </Text>
            </Section>
          </Section>

          <Section style={s.footer}>
            <Text style={s.footerTxt}>Nayab Posh Admin Notifications</Text>
            <Text style={s.footerTxt}>Triggered by order {orderNumber} ({orderId.slice(0, 8)}...)</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
