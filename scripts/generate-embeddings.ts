import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { PrismaClient } from '../lib/generated/prisma/client';
import cliProgress from 'cli-progress';

// --- Config ---
const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
const BATCH_SIZE = 25;
const MAX_RETRIES = 3;

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
if (!HF_API_KEY) {
  console.error('HUGGINGFACE_API_KEY is not set in .env');
  process.exit(1);
}

// --- Prisma client (same pattern as sync-pdfs-to-db.ts) ---
function createScriptPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL environment variable is not set');
  }

  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createScriptPrismaClient();

// --- Types ---
interface ChunkRow {
  id: string;
  content: string;
}

// --- HuggingFace API call with retry ---
async function fetchEmbeddings(texts: string[]): Promise<number[][]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
      });

      if (response.status === 429) {
        // Rate limited — exponential backoff
        const wait = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`\n  Rate limited (429). Retrying in ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }

      if (response.status === 503) {
        // Model is cold-starting
        console.warn('\n  Model loading (503). Waiting 20s for cold start...');
        await sleep(20000);
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HuggingFace API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      return data as number[][];
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        console.warn(`\n  Request failed: ${err.message}. Retrying in ${wait / 1000}s...`);
        await sleep(wait);
      }
    }
  }

  throw lastError || new Error('Failed to fetch embeddings after retries');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Format vector for pgvector SQL ---
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

// --- Main ---
async function main() {
  console.log('=== Embedding Generation Script ===\n');

  // 1. Test DB connection
  console.log('Connecting to database...');
  await prisma.$queryRaw`SELECT 1`;
  console.log('Connected.\n');

  // 2. Fetch chunks that have no embedding yet
  const chunks: ChunkRow[] = await prisma.$queryRaw`
    SELECT id, content FROM "DocumentChunk" WHERE embedding IS NULL
  `;

  if (chunks.length === 0) {
    console.log('All chunks already have embeddings. Nothing to do.');
    return;
  }

  console.log(`Found ${chunks.length} chunks without embeddings.\n`);

  // 3. Process in batches
  const progressBar = new cliProgress.SingleBar({
    format: 'Generating embeddings |{bar}| {percentage}% | {value}/{total} chunks',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  progressBar.start(chunks.length, 0);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.content);

    try {
      const embeddings = await fetchEmbeddings(texts);

      // Store each embedding back into the database
      for (let j = 0; j < batch.length; j++) {
        const vectorLiteral = toVectorLiteral(embeddings[j]);
        await prisma.$executeRawUnsafe(
          `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2::uuid`,
          vectorLiteral,
          batch[j].id
        );
      }

      successCount += batch.length;
    } catch (err: any) {
      console.error(`\n  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${err.message}`);
      failCount += batch.length;
    }

    progressBar.update(i + batch.length);
  }

  progressBar.stop();

  console.log(`\nDone! ${successCount} embeddings generated, ${failCount} failed.`);
  if (failCount > 0) {
    console.log('Re-run this script to retry failed chunks (it only processes NULL embeddings).');
  }
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
