import { Resend } from "resend";

// Constructed lazily — Resend's constructor throws synchronously when the
// API key is empty, which would otherwise crash Next.js's build-time page
// data collection for any route that imports this module (even ones that
// never actually send an email during the build).
let client: Resend | undefined;

function getResend(): Resend {
  return (client ??= new Resend(process.env.RESEND_API_KEY ?? ""));
}

export default getResend;
