import { prisma } from "@/lib/prisma";
import sendEmail from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";

// ── helpers ──────────────────────────────────────────────────────

const TABLE = "subscriptions";

/** Ensure the table exists (runs once per cold start at most). */
async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${TABLE}" (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT NOT NULL UNIQUE,
      is_subscribed BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── POST /api/subscribe ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 1. Make sure the table exists
    await ensureTable();

    // 2. Check if the email already exists
    const rows: { is_subscribed: boolean }[] = await prisma.$queryRawUnsafe(
      `SELECT is_subscribed FROM "${TABLE}" WHERE email = $1 LIMIT 1`,
      email
    );

    if (rows.length > 0) {
      const existing = rows[0];

      if (existing.is_subscribed) {
        return NextResponse.json(
          { error: "You are already subscribed!" },
          { status: 400 }
        );
      }

      // Re-subscribe
      await prisma.$executeRawUnsafe(
        `UPDATE "${TABLE}" SET is_subscribed = true, updated_at = now() WHERE email = $1`,
        email
      );
    } else {
      // New subscriber
      await prisma.$executeRawUnsafe(
        `INSERT INTO "${TABLE}" (email) VALUES ($1)`,
        email
      );
    }

    // 3. Build unsubscribe link
    const origin = "https://evalora-beta.vercel.app";
    const unsubscribeUrl = `${origin}/api/unsubscribe?email=${encodeURIComponent(email)}`;

    // 4. Send welcome email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%);padding:40px 40px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                      Welcome to Evalora! 🎉
                    </h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.85);font-size:15px;font-weight:500;">
                      You're now part of our learning community.
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 18px;color:#1e293b;font-size:16px;line-height:1.7;">
                      Hi there! 👋
                    </p>
                    <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.7;">
                      Thank you for subscribing to <strong style="color:#0ea5e9;">Evalora</strong>. 
                      You'll be the first to know about new features, platform updates, and educational insights.
                    </p>
                    <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">
                      We're on a mission to transform education with next‑gen analytics and seamless learning management. 
                      Stay tuned for exciting things ahead! 🚀
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:linear-gradient(135deg,#0ea5e9,#4f46e5);border-radius:12px;padding:14px 36px;">
                          <a href="${origin}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;display:inline-block;">
                            Visit Evalora →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer / Unsubscribe -->
                <tr>
                  <td style="padding:24px 40px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                    <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;">
                      Don't want to receive these emails?
                    </p>
                    <a href="${unsubscribeUrl}" style="display:inline-block;padding:10px 28px;background-color:#fee2e2;color:#dc2626;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">
                      Cancel Subscription
                    </a>
                    <p style="margin:16px 0 0;color:#cbd5e1;font-size:11px;">
                      © ${new Date().getFullYear()} Evalora Inc. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `Welcome to Evalora!\n\nThank you for subscribing. You'll get the latest updates on features and releases.\n\nVisit us: ${origin}\n\nTo unsubscribe: ${unsubscribeUrl}`;

    await sendEmail({
      to: email,
      subject: "Welcome to Evalora! 🎉",
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("/api/subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
