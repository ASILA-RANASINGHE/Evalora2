import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const TABLE = "subscriptions";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return new NextResponse(buildHTML("Invalid Request", "No email address provided.", false), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Set is_subscribed = false
    const result: { count: number }[] = await prisma.$queryRawUnsafe(
      `UPDATE "${TABLE}" SET is_subscribed = false, updated_at = now() WHERE email = $1 AND is_subscribed = true RETURNING 1`,
      email
    );

    if (result.length === 0) {
      return new NextResponse(
        buildHTML(
          "Already Unsubscribed",
          "This email is not currently subscribed, or was already cancelled.",
          false
        ),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new NextResponse(
      buildHTML(
        "Unsubscribed Successfully",
        "You have been removed from our mailing list. You can re‑subscribe at any time from our website.",
        true
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    console.error("/api/unsubscribe error:", err);
    return new NextResponse(
      buildHTML("Error", "Something went wrong. Please try again later.", false),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// ── HTML builder ─────────────────────────────────────────────────

function buildHTML(title: string, message: string, success: boolean) {
  const accentColor = success ? "#10b981" : "#f59e0b";
  const icon = success
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="${accentColor}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="${accentColor}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — Evalora</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f0f4f8;font-family:'Segoe UI',system-ui,sans-serif;padding:24px}
    .card{background:#fff;border-radius:24px;padding:48px;max-width:460px;width:100%;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.06)}
    .icon{margin-bottom:20px}
    h1{font-size:22px;font-weight:800;color:#0f172a;margin-bottom:12px}
    p{font-size:15px;color:#64748b;line-height:1.6;margin-bottom:28px}
    a.btn{display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a class="btn" href="https://evalora-beta.vercel.app">Back to Evalora</a>
  </div>
</body>
</html>`;
}
