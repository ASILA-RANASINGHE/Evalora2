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

  return transporter.sendMail(mail as any);
}

export default sendEmail;
