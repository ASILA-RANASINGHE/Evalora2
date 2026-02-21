"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  ChatMessage,
  Conversation,
  SyllabusFile,
} from "../types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  isTyping: boolean;
  syllabus: SyllabusFile | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  isTyping: false,
  syllabus: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ChatAction =
  | { type: "CREATE_CONVERSATION"; payload: { conversation: Conversation; welcomeMessage?: ChatMessage } }
  | { type: "DELETE_CONVERSATION"; payload: { conversationId: string } }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: { conversationId: string } }
  | { type: "RENAME_CONVERSATION"; payload: { conversationId: string; title: string } }
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: ChatMessage } }
  | { type: "UPDATE_MESSAGE_STATUS"; payload: { conversationId: string; messageId: string; status: ChatMessage["status"] } }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_SYLLABUS"; payload: SyllabusFile | null }
  | { type: "LOAD_STATE"; payload: Pick<ChatState, "conversations" | "messagesByConversation" | "activeConversationId"> };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "CREATE_CONVERSATION": {
      const { conversation, welcomeMessage } = action.payload;
      return {
        ...state,
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversation.id]: welcomeMessage ? [welcomeMessage] : [],
        },
      };
    }

    case "DELETE_CONVERSATION": {
      const { conversationId } = action.payload;
      const filtered = state.conversations.filter((c) => c.id !== conversationId);
      const { [conversationId]: _, ...remainingMessages } = state.messagesByConversation;

      let nextActiveId = state.activeConversationId;
      if (state.activeConversationId === conversationId) {
        nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      }

      return {
        ...state,
        conversations: filtered,
        activeConversationId: nextActiveId,
        messagesByConversation: remainingMessages,
      };
    }

    case "SET_ACTIVE_CONVERSATION": {
      return {
        ...state,
        activeConversationId: action.payload.conversationId,
      };
    }

    case "RENAME_CONVERSATION": {
      const { conversationId, title } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, title, updatedAt: now } : c
        ),
      };
    }

    case "ADD_MESSAGE": {
      const { conversationId, message } = action.payload;
      const existing = state.messagesByConversation[conversationId] ?? [];
      const now = new Date().toISOString();
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, message],
        },
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messageCount: existing.length + 1, updatedAt: now }
            : c
        ),
      };
    }

    case "UPDATE_MESSAGE_STATUS": {
      const { conversationId, messageId, status } = action.payload;
      const msgs = state.messagesByConversation[conversationId];
      if (!msgs) return state;

      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: msgs.map((m) =>
            m.id === messageId ? { ...m, status } : m
          ),
        },
      };
    }

    case "SET_TYPING": {
      return { ...state, isTyping: action.payload };
    }

    case "SET_SYLLABUS": {
      return { ...state, syllabus: action.payload };
    }

    case "LOAD_STATE": {
      return {
        ...state,
        conversations: action.payload.conversations,
        messagesByConversation: action.payload.messagesByConversation,
        activeConversationId: action.payload.activeConversationId,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ChatContextValue {
  state: ChatState;
  dispatch: Dispatch<ChatAction>;

  // Convenience selectors
  activeMessages: ChatMessage[];
  activeConversation: Conversation | undefined;

  // Convenience action creators
  createConversation: (conversation: Conversation, welcomeMessage?: ChatMessage) => void;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: ChatMessage["status"]) => void;
  setTyping: (isTyping: boolean) => void;
  setSyllabus: (syllabus: SyllabusFile | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ChatProviderProps {
  children: ReactNode;
  initial?: Partial<ChatState>;
}

export function ChatProvider({ children, initial }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    ...initial,
  });

  // Derived state
  const activeMessages =
    state.activeConversationId
      ? state.messagesByConversation[state.activeConversationId] ?? []
      : [];

  const activeConversation = state.conversations.find(
    (c) => c.id === state.activeConversationId
  );

  // Stable action creators
  const createConversation = useCallback(
    (conversation: Conversation, welcomeMessage?: ChatMessage) =>
      dispatch({ type: "CREATE_CONVERSATION", payload: { conversation, welcomeMessage } }),
    []
  );

  const deleteConversation = useCallback(
    (conversationId: string) =>
      dispatch({ type: "DELETE_CONVERSATION", payload: { conversationId } }),
    []
  );

  const setActiveConversation = useCallback(
    (conversationId: string) =>
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: { conversationId } }),
    []
  );

  const renameConversation = useCallback(
    (conversationId: string, title: string) =>
      dispatch({ type: "RENAME_CONVERSATION", payload: { conversationId, title } }),
    []
  );

  const addMessage = useCallback(
    (conversationId: string, message: ChatMessage) =>
      dispatch({ type: "ADD_MESSAGE", payload: { conversationId, message } }),
    []
  );

  const updateMessageStatus = useCallback(
    (conversationId: string, messageId: string, status: ChatMessage["status"]) =>
      dispatch({ type: "UPDATE_MESSAGE_STATUS", payload: { conversationId, messageId, status } }),
    []
  );

  const setTyping = useCallback(
    (isTyping: boolean) => dispatch({ type: "SET_TYPING", payload: isTyping }),
    []
  );

  const setSyllabus = useCallback(
    (syllabus: SyllabusFile | null) =>
      dispatch({ type: "SET_SYLLABUS", payload: syllabus }),
    []
  );

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        activeMessages,
        activeConversation,
        createConversation,
        deleteConversation,
        setActiveConversation,
        renameConversation,
        addMessage,
        updateMessageStatus,
        setTyping,
        setSyllabus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a <ChatProvider>");
  }
  return ctx;
}
