import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const BUCKET = 'note-attachments';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for syllabus API');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const grade = url.searchParams.get('grade');
    const subject = url.searchParams.get('subject');

    if (!grade || !subject) {
      return NextResponse.json({ error: 'grade and subject required' }, { status: 400 });
    }

    // Try to find a matching PDF filename from processed list (best-effort)
    const processedPath = path.join(process.cwd(), 'scripts', 'processed-files.json');
    let files: string[] = [];
    try {
      const raw = fs.readFileSync(processedPath, 'utf-8');
      files = JSON.parse(raw) as string[];
    } catch {
      files = [];
    }

    const qGrade = grade.toString();
    const qSubject = subject.toLowerCase();

    const match = files.find((f) => {
      const lower = f.toLowerCase();
      // Patterns like 'grade7_history' or 'historygrade7' or 'grade7_history_rewritten'
      return (lower.includes(qSubject) && (lower.includes(`grade${qGrade}`) || lower.includes(`${qGrade}_`)));
    });

    if (!match) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(match as string);
    const publicUrl = data?.publicUrl ?? null;

    if (!publicUrl) return NextResponse.json({ found: false }, { status: 404 });

    return NextResponse.json({ found: true, url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
