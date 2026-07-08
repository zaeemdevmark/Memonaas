import type { NextRequest } from "next/server";
import resend from "@/lib/email/client";
import { ok, err } from "@/lib/api/response";

interface ContactBody {
  name:    string;
  email:   string;
  phone?:  string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: ContactBody;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const { name, email, phone, subject, message } = body;

  if (!name?.trim())    return err("Name is required", 400);
  if (!email?.trim())   return err("Email is required", 400);
  if (!subject?.trim()) return err("Subject is required", 400);
  if (!message?.trim()) return err("Message is required", 400);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email.trim())) return err("Please provide a valid email address", 400);

  const adminTo = process.env.ADMIN_EMAIL_TO ?? "admin@memonaas.com";
  const from    = process.env.EMAIL_FROM     ?? "Memonaas <noreply@memonaas.com>";

  try {
    await resend.emails.send({
      from,
      to:      adminTo,
      replyTo: email.trim(),
      subject: `[Contact Form] ${subject.trim()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Poppins', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111111;">
          <div style="border-bottom: 2px solid #111111; padding-bottom: 16px; margin-bottom: 24px;">
            <p style="margin:0; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#6B6B6B;">MEMONAAS</p>
            <h1 style="margin:8px 0 0; font-size:22px; font-weight:400;">New Contact Form Submission</h1>
          </div>
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr style="border-bottom:1px solid #E5E5E5;">
              <td style="padding:10px 0; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6B6B; width:100px;">Name</td>
              <td style="padding:10px 0; font-size:14px; color:#111111;">${escapeHtml(name.trim())}</td>
            </tr>
            <tr style="border-bottom:1px solid #E5E5E5;">
              <td style="padding:10px 0; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6B6B;">Email</td>
              <td style="padding:10px 0; font-size:14px; color:#111111;">${escapeHtml(email.trim())}</td>
            </tr>
            ${phone?.trim() ? `
            <tr style="border-bottom:1px solid #E5E5E5;">
              <td style="padding:10px 0; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6B6B;">Phone</td>
              <td style="padding:10px 0; font-size:14px; color:#111111;">${escapeHtml(phone.trim())}</td>
            </tr>` : ""}
            <tr style="border-bottom:1px solid #E5E5E5;">
              <td style="padding:10px 0; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6B6B;">Subject</td>
              <td style="padding:10px 0; font-size:14px; color:#111111;">${escapeHtml(subject.trim())}</td>
            </tr>
          </table>
          <div style="background:#FAFAFA; border-left:3px solid #111111; padding:16px 20px; margin-bottom:24px;">
            <p style="margin:0 0 8px; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6B6B;">Message</p>
            <p style="margin:0; font-size:14px; line-height:1.7; color:#111111; white-space:pre-wrap;">${escapeHtml(message.trim())}</p>
          </div>
          <p style="font-size:11px; color:#6B6B6B; border-top:1px solid #E5E5E5; padding-top:16px;">
            This message was submitted via the Memonaas contact form. Reply directly to this email to respond to ${escapeHtml(name.trim())}.
          </p>
        </body>
        </html>
      `,
    });

    return ok({ message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("[contact] email send failed:", error);
    return err("Failed to send message. Please try again later.", 500);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}
