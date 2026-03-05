import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import cliProgress from 'cli-progress';
import ora from 'ora';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const chunkProgressBar = new cliProgress.SingleBar({
  format: 'Processing Chunks |{bar}| {percentage}% | {value}/{total} Chunks',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

export async function getPdfListFromBucket() {
  const spinner = ora('Fetching file list from "note-attachments" bucket...').start();
  
  const { data, error } = await supabase.storage
    .from('note-attachments')
    .list();

  if (error) {
    spinner.fail(`Failed to list files: ${error.message}`);
    throw new Error(`Failed to list files: ${error.message}`);
  }

  const pdfFiles = data.filter(file => file.name.endsWith('.pdf'));
  spinner.succeed(`Found ${pdfFiles.length} PDFs in the bucket.\n`);
  
  return pdfFiles.map(file => file.name);
}

export async function downloadPdfAsBuffer(fileName: string): Promise<Uint8Array> {
  const spinner = ora(`Downloading ${fileName}...`).start();
  
  const { data, error } = await supabase.storage
    .from('note-attachments')
    .download(fileName);

  if (error || !data) {
    spinner.fail(`Failed to download ${fileName}`);
    throw new Error(`Failed to download ${fileName}: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  spinner.succeed(`Downloaded ${fileName} successfully.`);
  
  return new Uint8Array(arrayBuffer);
}