import { streamText, type Message } from "ai";
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

// --- Route handler ---
export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Find the latest user message for retrieval
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage?.content) {
    return new Response("No user message provided", { status: 400 });
  }

  // Retrieve relevant chunks — if retrieval fails, continue without context
  let chunks: RetrievedChunk[] = [];
  try {
    chunks = await retrieveRelevantChunks(
      typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : ""
    );
  } catch (err) {
    console.error("Retrieval failed, proceeding without context:", err);
  }

  // Build the context-augmented messages
  const contextBlock = formatContext(chunks);
  const augmentedMessages = messages.map((msg, idx) => {
    // Append context to the last user message only
    if (idx === messages.length - 1 && msg.role === "user" && contextBlock) {
      return { ...msg, content: msg.content + contextBlock };
    }
    return msg;
  });

  // Stream the response
  const result = streamText({
    model: huggingface("HuggingFaceH4/zephyr-7b-beta"),
    system: SYSTEM_PROMPT,
    messages: augmentedMessages,
  });

  return result.toDataStreamResponse();
}
