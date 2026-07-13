import * as React from "react";
import { render } from "@react-email/render";
import getResend from "@/lib/email/client";
import type { OrderDTO } from "@/lib/types/order";
import type { LowStockItem } from "@/lib/email/templates/LowStockAlert";
import OrderConfirmationEmail from "@/lib/email/templates/OrderConfirmation";
import ShippingUpdateEmail from "@/lib/email/templates/ShippingUpdate";
import DeliveryConfirmationEmail from "@/lib/email/templates/DeliveryConfirmation";
import OrderCancellationEmail from "@/lib/email/templates/OrderCancellation";
import NewOrderAdminEmail from "@/lib/email/templates/NewOrderAdmin";
import LowStockAlertEmail from "@/lib/email/templates/LowStockAlert";

const FROM        = process.env.EMAIL_FROM     ?? "Memonaas <noreply@memonaas.com>";
const ADMIN_TO    = process.env.ADMIN_EMAIL_TO ?? "admin@memonaas.com";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await getResend().emails.send({ from: FROM, to, subject, html });
}

export async function sendOrderConfirmation(order: OrderDTO): Promise<void> {
  if (!order.shipping.email) return;
  try {
    const html = await render(React.createElement(OrderConfirmationEmail, { order }));
    await sendEmail(order.shipping.email, `Order Confirmed — ${order.orderNumber}`, html);
  } catch (err) {
    console.error("[email] sendOrderConfirmation failed:", err);
  }
}

export async function sendOrderShipped(order: OrderDTO): Promise<void> {
  if (!order.shipping.email) return;
  try {
    const html = await render(React.createElement(ShippingUpdateEmail, { order }));
    await sendEmail(order.shipping.email, `Your order is on its way — ${order.orderNumber}`, html);
  } catch (err) {
    console.error("[email] sendOrderShipped failed:", err);
  }
}

export async function sendOrderDelivered(order: OrderDTO): Promise<void> {
  if (!order.shipping.email) return;
  try {
    const html = await render(React.createElement(DeliveryConfirmationEmail, { order }));
    await sendEmail(order.shipping.email, `Your order has been delivered — ${order.orderNumber}`, html);
  } catch (err) {
    console.error("[email] sendOrderDelivered failed:", err);
  }
}

export async function sendOrderCancelled(order: OrderDTO): Promise<void> {
  if (!order.shipping.email) return;
  try {
    const html = await render(React.createElement(OrderCancellationEmail, { order }));
    await sendEmail(order.shipping.email, `Your order has been cancelled — ${order.orderNumber}`, html);
  } catch (err) {
    console.error("[email] sendOrderCancelled failed:", err);
  }
}

export async function sendNewOrderAdmin(order: OrderDTO): Promise<void> {
  try {
    const html = await render(React.createElement(NewOrderAdminEmail, { order }));
    await sendEmail(ADMIN_TO, `New Order — ${order.orderNumber} (${order.payment?.method ?? "—"})`, html);
  } catch (err) {
    console.error("[email] sendNewOrderAdmin failed:", err);
  }
}

export async function sendLowStockAlert(
  items:       LowStockItem[],
  orderId:     string,
  orderNumber: string,
): Promise<void> {
  if (items.length === 0) return;
  try {
    const html = await render(React.createElement(LowStockAlertEmail, { items, orderId, orderNumber }));
    const subject = `Low Stock Alert — ${items.length} variant${items.length !== 1 ? "s" : ""} after order ${orderNumber}`;
    await sendEmail(ADMIN_TO, subject, html);
  } catch (err) {
    console.error("[email] sendLowStockAlert failed:", err);
  }
}
