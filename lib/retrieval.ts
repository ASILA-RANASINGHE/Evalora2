import { prisma } from "@/lib/prisma";

// --- Config ---
const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://router.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;
const MAX_RETRIES = 3;
const TOP_K = 3;

// --- Types ---
export interface RetrievedChunk {
  id: string;
  title: string;
  topic: string | null;
  content: string;
  grade: string | null;
  similarity: number;
}

// --- Embed a single query string ---
async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      });

      if (response.status === 429) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        await sleep(wait);
        continue;
      }

      if (response.status === 503) {
        await sleep(20000);
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HuggingFace API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      return data as number[];
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(Math.pow(2, attempt + 1) * 1000);
      }
    }
  }

  throw lastError || new Error("Failed to embed query after retries");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Main retrieval function ---
export async function retrieveRelevantChunks(
  userQuestion: string
): Promise<RetrievedChunk[]> {
  // 1. Embed the user's question with the same model used for storage
  const queryEmbedding = await embedQuery(userQuestion);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // 2. Cosine similarity search using pgvector's <=> operator
  //    <=> returns cosine *distance* (0 = identical, 2 = opposite),
  //    so similarity = 1 - distance.
  const chunks: RetrievedChunk[] = await prisma.$queryRawUnsafe(
    `
    SELECT
      id,
      title,
      topic,
      content,
      grade,
      1 - (embedding <=> $1::vector) AS similarity
    FROM "DocumentChunk"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    vectorLiteral,
    TOP_K
  );

  return chunks;
}
