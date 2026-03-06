import { streamText } from "ai";
import { huggingface } from "@ai-sdk/huggingface";
import {
  retrieveRelevantChunks,
  type RetrievedChunk,
} from "@/lib/retrieval";

// --- System prompt ---
const SYSTEM_PROMPT = `You are Evalora, an AI educational assistant built specifically for Sri Lankan students.

## Your Personality
- Warm, encouraging, and patient — like a supportive tutor who genuinely wants students to succeed.
- Culturally aware — you understand Sri Lanka's education system (O/L and A/L examinations, the national syllabus, bilingual learning environments).
- You celebrate small wins and encourage curiosity.

## Your Rules
1. **Ground your answers in the provided context.** When context chunks are given, base your educational explanations strictly on that material. Do not invent facts, dates, or details beyond what the context provides.
2. **If the context does not contain the answer**, say so honestly: "I don't have enough information on that topic in my current materials. Could you try rephrasing, or ask me about a related topic?"
3. **Never fabricate historical dates, names, or statistics.** Accuracy matters — these students may be preparing for national exams.
4. **Explain clearly.** Break down complex ideas into simple steps. Use analogies familiar to Sri Lankan students when helpful.
5. **Stay on topic.** You are an educational assistant. Politely redirect off-topic conversations back to learning.
6. **Use markdown formatting** for readability — bullet points, numbered lists, bold key terms, and headers where appropriate.

## How to Use Context
When context chunks are appended to the user's message, treat them as your textbook. Synthesize information across chunks to give a complete answer, cite which topic/title the information comes from when relevant, and present it in a student-friendly way.`;

// --- Format chunks into a context block ---
function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const formatted = chunks
    .map((chunk, i) => {
      const meta = [chunk.title, chunk.topic, chunk.grade]
        .filter(Boolean)
        .join(" | ");
      return `--- Chunk ${i + 1} (${meta}) [similarity: ${Number(chunk.similarity).toFixed(2)}] ---\n${chunk.content}`;
    })
    .join("\n\n");

  return `\n\n<context>\nThe following reference material was retrieved from the knowledge base. Use it to answer the student's question.\n\n${formatted}\n</context>`;
}

// --- Extract plain text from a UIMessage's parts array ---
function extractText(parts: Array<{ type: string; text?: string }>): string {
  return (parts ?? [])
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("");
}

// --- Route handler ---
export async function POST(req: Request) {
  const body = await req.json();
  const rawMessages: Array<{
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }> = body.messages ?? [];

  // Build clean ModelMessage objects from whatever the client sends
  const modelMessages: Array<{ role: "user" | "assistant"; content: string }> =
    [];

  for (const msg of rawMessages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    // Support both v6 (parts) and legacy (content) formats
    const text = msg.parts ? extractText(msg.parts) : (msg.content ?? "");
    if (text) {
      modelMessages.push({ role: msg.role, content: text });
    }
  }

  if (modelMessages.length === 0 || modelMessages[modelMessages.length - 1].role !== "user") {
    return new Response("No user message provided", { status: 400 });
  }

  const userText = modelMessages[modelMessages.length - 1].content;

  // Retrieve relevant chunks — if retrieval fails, continue without context
  let chunks: RetrievedChunk[] = [];
  try {
    chunks = await retrieveRelevantChunks(userText);
  } catch (err) {
    console.error("Retrieval failed, proceeding without context:", err);
  }

  // Append context to the last user message
  const contextBlock = formatContext(chunks);
  if (contextBlock) {
    modelMessages[modelMessages.length - 1].content += contextBlock;
  }

  // Stream the response
  const result = streamText({
    model: huggingface("Qwen/Qwen2.5-72B-Instruct"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  });

  // Pass RAG metadata via headers so the client can display debug info
  const ragDebug = chunks.map((c) => ({
    title: c.title,
    topic: c.topic,
    grade: c.grade,
    similarity: Number(c.similarity).toFixed(3),
    preview: c.content.slice(0, 120),
  }));

  return result.toUIMessageStreamResponse({
    headers: {
      "X-RAG-Chunks": encodeURIComponent(JSON.stringify(ragDebug)),
    },
  });
}
