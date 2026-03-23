import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sendEmail from '@/lib/nodemailer';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE = path.join(DATA_DIR, 'subscribers.json');

async function ensureStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(STORE);
  } catch (err) {
    await fs.writeFile(STORE, '[]', 'utf8');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await ensureStore();
    const raw = await fs.readFile(STORE, 'utf8');
    const subs = JSON.parse(raw || '[]');

    // generate token
    const token = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);

    const existing = subs.find((s: any) => s.email === email);
    if (existing) {
      existing.token = token;
      existing.updatedAt = new Date().toISOString();
    } else {
      subs.push({ email, token, createdAt: new Date().toISOString() });
    }

    await fs.writeFile(STORE, JSON.stringify(subs, null, 2), 'utf8');

    // send welcome email with unsubscribe link
    const origin = new URL(request.url).origin;
    const unsubscribeUrl = `${origin}/api/unsubscribe?token=${encodeURIComponent(token)}`;

    const subject = 'Welcome to Evalora updates';
    const html = `
      <p>Hello,</p>
      <p>Thanks for subscribing to Evalora updates. We'll send you occasional product news and updates.</p>
      <p>If you'd like to stop receiving these messages you can <a href="${unsubscribeUrl}">unsubscribe here</a>, or click the button below:</p>
      <p><a href="${unsubscribeUrl}" style="display:inline-block;padding:12px 20px;background:#0ea5e9;color:#fff;border-radius:8px;text-decoration:none;">Cancel subscription</a></p>
      <p>— Evalora Support</p>
    `;

    const text = `Welcome to Evalora updates. To unsubscribe visit: ${unsubscribeUrl}`;

    try {
      await sendEmail({ to: email, subject, html, text });
    } catch (err) {
      console.error('subscribe: sendEmail error', err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/subscribe error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
