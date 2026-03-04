import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getPdfListFromBucket() {
  console.log('Fetching file list from "note-attachments" bucket...');
  
  const { data, error } = await supabase.storage
    .from('note-attachments')
    .list();

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  const pdfFiles = data.filter(file => file.name.endsWith('.pdf'));
  console.log(`Found ${pdfFiles.length} PDFs in the bucket.\n`);
  
  return pdfFiles.map(file => file.name);
}

export async function downloadPdfAsBuffer(fileName: string): Promise<Uint8Array> {
  console.log(`Downloading ${fileName}...`);
  
  const { data, error } = await supabase.storage
    .from('note-attachments')
    .download(fileName);

  if (error || !data) {
    throw new Error(`Failed to download ${fileName}: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}