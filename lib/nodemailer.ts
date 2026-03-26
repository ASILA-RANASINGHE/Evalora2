import nodemailer from "nodemailer";

export interface EmailPayload {
  to: string | string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 0);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user || "no-reply@example.com";

function extractAddress(fromStr: string) {
  if (!fromStr) return undefined;
  // match address inside <> if present, otherwise try to find bare email
  const m = fromStr.match(/<([^>]+)>/);
  if (m && m[1]) return m[1].trim();
  const m2 = fromStr.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  return m2 ? m2[0] : undefined;
}

const envelopeFrom = extractAddress(from) || user;

if (!host) {
  console.warn("SMTP host not configured (SMTP_HOST missing)");
}

export const transporter = nodemailer.createTransport({
  host: host,
  port: port || 587,
  secure: port === 465 || process.env.SMTP_SECURE === "true",
  auth: user && pass ? { user, pass } : undefined,
});

export async function sendEmail(payload: EmailPayload) {
  const mail = {
    from,
    to: payload.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };
  
  if (!host || !user || !pass) {
    console.warn("SMTP not fully configured — logging mail to console (dev fallback)");
    console.log("[mail]", JSON.stringify(mail, null, 2));
    return Promise.resolve({ dev: true } as any);
  }

  // Provide an explicit SMTP envelope. Some providers (Gmail) still rewrite
  // the visible From name to the authenticated account, but setting the
  // envelope can help other SMTP providers and ensures MAIL FROM is correct.
  return transporter.sendMail({
    ...mail,
    envelope: { from: envelopeFrom, to: payload.to },
  } as any);
}

export default sendEmail;