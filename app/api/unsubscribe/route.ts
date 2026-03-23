import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STORE = path.join(process.cwd(), 'data', 'subscribers.json');

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    let subs: any[] = [];
    try {
      const raw = await fs.readFile(STORE, 'utf8');
      subs = JSON.parse(raw || '[]');
    } catch (err) {
      // no store
    }

    const before = subs.length;
    subs = subs.filter(s => s.token !== token);
    if (subs.length !== before) {
      await fs.writeFile(STORE, JSON.stringify(subs, null, 2), 'utf8');
    }

    // return simple HTML confirmation
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head><body style="font-family:system-ui,Arial,sans-serif;padding:32px;">` +
      `<h2>You've been unsubscribed</h2><p>We're sorry to see you go. You will no longer receive Evalora updates at this address.</p>` +
      `</body></html>`;

    return new NextResponse(html, { status: 200, headers: { 'content-type': 'text/html' } });
  } catch (err) {
    console.error('/api/unsubscribe error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
