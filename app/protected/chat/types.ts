// Shared types for the chat feature

export interface Citation {
  label: string;
  page: number;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  timestamp: string;
  text: string;
  citations?: Citation[];
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
