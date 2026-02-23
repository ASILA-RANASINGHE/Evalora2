// Shared types for the chat feature

export interface BoundingBox {
  /** Normalized coordinates 0..1 relative to page dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Citation {
  label: string;
  page: number;
  snippet: string;
  source: string;

  // RAG-specific fields (optional for backward compatibility)
  file_id?: string;
  page_number?: number;
  bounding_box?: BoundingBox;
  paragraph_index?: number;
  highlight_text?: string;
}

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  timestamp: string;
  text: string;
  citations?: Citation[];
  quizHint?: string;
  status?: "sending" | "delivered" | "error";
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface SyllabusFile {
  name: string;
  size: string;
}
