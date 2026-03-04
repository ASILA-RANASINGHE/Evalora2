"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { Sidebar, type Session, type SyllabusFile } from "./components/sidebar";
import { ChatHeader } from "./components/chat-header";
import {
  MessageBubble,
  type ChatMessage,
} from "./components/MessageBubble";
import type { Citation, BoundingBox } from "@/app/protected/chat/types";
import { ChatContainer } from "./components/ChatContainer";
import { ChatInput } from "./components/chat-input";
import { ReferencePanel } from "./components/reference-panel";
import { StudyToolsSidebar } from "./components/study-tools/study-tools-sidebar";
import dynamic from "next/dynamic";
const DocumentViewer = dynamic(
  () => import("./components/document-viewer").then((m) => m.DocumentViewer),
  { ssr: false }
);
import { WhiteboardPanel } from "./components/WhiteboardPanel";
import {
  generateQuizProblem,
  generateGradingResponse,
  type QuizProblem,
} from "./components/quiz-challenge-prompt";
import { exportTranscript } from "./utils/export-transcript";
import "katex/dist/katex.min.css";

const welcomeMessage: ChatMessage = {
  id: 1,
  sender: "bot",
  timestamp: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  text: `## Welcome to EduBot! 👋

I'm your **Senior Academic Advisor**. I can help you with:

- [ ] Reviewing course material
- [ ] Solving math problems step-by-step
- [ ] Formatting essays and theses
- [x] Getting started with your session

Feel free to ask me anything — from algebra to essay writing!`,
};

const demoMessages: ChatMessage[] = [
  { ...welcomeMessage, timestamp: "10:00 AM" },
  {
    id: 2,
    sender: "user",
    timestamp: "10:01 AM",
    text: "Can you explain the quadratic formula and show me how to solve x² + 5x + 6 = 0?",
  },
  {
    id: 3,
    sender: "bot",
    timestamp: "10:01 AM",
    text: `### The Quadratic Formula

For any equation of the form $ax^2 + bx + c = 0$, the solutions are given by:

$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### Solving $x^2 + 5x + 6 = 0$

Here, $a = 1$, $b = 5$, $c = 6$. Substituting:

$$x = \\frac{-5 \\pm \\sqrt{25 - 24}}{2} = \\frac{-5 \\pm 1}{2}$$

This gives us two solutions:

| Step | Calculation | Result |
|------|------------|--------|
| $x_1$ | $(-5 + 1) / 2$ | $-2$ |
| $x_2$ | $(-5 - 1) / 2$ | $-3$ |

> **Tip:** You can verify by factoring: $x^2 + 5x + 6 = (x + 2)(x + 3)$, which confirms $x = -2$ and $x = -3$.

As noted in your syllabus [p. 12], understanding sorting algorithm analysis relies on similar quadratic recurrences. See also [Sec 2.1] for foundational data structures.`,
    citations: [
      {
        label: "p. 12",
        page: 12,
        snippet:
          "The quadratic formula can be applied to analyze the average-case behavior of certain recursive sorting algorithms.",
        source: "CS201_Syllabus.pdf",
        file_id: "demo-cs201",
        highlight_text: "quadratic formula can be applied to analyze",
      },
      {
        label: "Sec 2.1",
        page: 4,
        snippet:
          "An array is a contiguous block of memory that stores elements of the same type. Access time is O(1) for indexed access.",
        source: "CS201_Syllabus.pdf",
        file_id: "demo-cs201",
        highlight_text: "array is a contiguous block of memory",
      },
    ],
  },
  {
    id: 4,
    sender: "user",
    timestamp: "10:03 AM",
    text: "Can you give me a study plan for my algebra test next week?",
  },
  {
    id: 5,
    sender: "bot",
    timestamp: "10:03 AM",
    text: `### 📚 Algebra II Study Plan

Here's a structured plan for your upcoming test:

- [x] Review quadratic formula & factoring
- [ ] Practice completing the square
- [ ] Study polynomial long division
- [ ] Review systems of equations
- [ ] Take a practice test

### Key Formulas to Memorize

$$a^2 - b^2 = (a+b)(a-b)$$

$$ax^2 + bx + c = a(x - x_1)(x - x_2)$$

### Common Mistakes to Avoid

> Always check the discriminant $b^2 - 4ac$ first. If it's negative, there are no real solutions!

Based on your grading criteria [p. 15], the midterm is worth 25% — focus on chapters 1–5 first.

Here's a quick Python snippet to verify your answers:

\`\`\`python
import math

def solve_quadratic(a, b, c):
    disc = b**2 - 4*a*c
    if disc < 0:
        return "No real solutions"
    x1 = (-b + math.sqrt(disc)) / (2*a)
    x2 = (-b - math.sqrt(disc)) / (2*a)
    return x1, x2
\`\`\`

Would you like me to dive deeper into any of these topics?`,
    citations: [
      {
        label: "p. 15",
        page: 15,
        snippet:
          "Midterm Exam 25%, Final Exam 30%, Programming Assignments 25%, Quizzes 10%, Class Participation 10%.",
        source: "CS201_Syllabus.pdf",
        file_id: "demo-cs201",
        highlight_text: "Midterm Exam",
      },
    ],
  },
];

// Initial sessions with pre-loaded demo data
const initialSessions: Session[] = [
  { id: "1", title: "Algebra II Review", date: "Today" },
  { id: "2", title: "Thesis Formatting Guide", date: "Today" },
  { id: "3", title: "Physics: Wave Equations", date: "Yesterday" },
  { id: "4", title: "Essay Structure Help", date: "Yesterday" },
  { id: "5", title: "Calculus Integration", date: "2 days ago" },
  { id: "6", title: "History: World War II", date: "3 days ago" },
];

// Store messages per session
const initialChatHistories: Record<string, ChatMessage[]> = {
  "1": demoMessages,
  "2": [welcomeMessage],
  "3": [welcomeMessage],
  "4": [welcomeMessage],
  "5": [welcomeMessage],
  "6": [welcomeMessage],
};

function generateTitle(text: string): string {
  const cleaned = text.replace(/\[Attached:.*?\]\n?/g, "").trim();
  if (!cleaned) return "New Chat";
  return cleaned.length > 30 ? cleaned.slice(0, 30) + "..." : cleaned;
}

export default function ConversationPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState("1");
  const [chatHistories, setChatHistories] =
    useState<Record<string, ChatMessage[]>>(initialChatHistories);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [studyToolsOpen, setStudyToolsOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusFile | null>({
    name: "CS201_Syllabus.pdf",
    size: "2.4 MB",
  });

  // Added isTyping state
  const [isTyping, setIsTyping] = useState(false);

  // Document viewer state
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [docViewerPage, setDocViewerPage] = useState(1);
  const [docViewerFile, setDocViewerFile] = useState("CS201_Syllabus.pdf");
  const [docViewerPdfUrl, setDocViewerPdfUrl] = useState<string | null>(
    "/demo/CS201_Syllabus.pdf"
  );
  const [docViewerHighlight, setDocViewerHighlight] = useState<
    string | undefined
  >();
  const [docViewerHighlightBox, setDocViewerHighlightBox] = useState<
    BoundingBox | undefined
  >();
  const [docViewerParagraphIndex, setDocViewerParagraphIndex] = useState<
    number | undefined
  >();

  // Quiz / whiteboard state
  const [quizMode, setQuizMode] = useState<{
    active: boolean;
    topic: string;
    awaitingAnswer: boolean;
  } | null>(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const currentProblemRef = useRef<QuizProblem | null>(null);

  const messages = chatHistories[activeSessionId] || [];

  const handleNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newWelcome: ChatMessage = {
      ...welcomeMessage,
      id: Date.now(),
      timestamp: now,
    };

    setSessions((prev) => [
      { id: newId, title: "New Chat", date: "Just now" },
      ...prev,
    ]);
    setChatHistories((prev) => ({
      ...prev,
      [newId]: [newWelcome],
    }));
    setActiveSessionId(newId);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (id === activeSessionId && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
        if (filtered.length === 0) {
          handleNewChat();
          return [];
        }
        return filtered;
      });
      setChatHistories((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    },
    [activeSessionId, handleNewChat]
  );

  const handleCitationClick = (page: number, source: string, citation?: Citation) => {
    setDocViewerFile(source);
    setDocViewerPage(page);
    setDocViewerPdfUrl(`/demo/${source}`);
    setDocViewerHighlightBox(citation?.bounding_box);
    setDocViewerParagraphIndex(citation?.paragraph_index);
    setDocViewerHighlight(citation?.highlight_text ?? citation?.snippet);
    setDocViewerOpen(true);
    setWhiteboardOpen(false);
  };

  // ── Quiz handlers ─────────────────────────────────────────────────────

  const handleStartQuiz = useCallback(() => {
    const recentTexts = messages.slice(-4).map((m) => m.text);
    const syllabusName = syllabus?.name ?? null;
    const problem = generateQuizProblem(recentTexts, syllabusName);

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const problemMessage: ChatMessage = {
      id: Date.now(),
      sender: "bot",
      timestamp: now,
      text: problem.problemText,
      quizHint: problem.hintText,
      ...(syllabusName && {
        citations: [
          {
            label: "Syllabus",
            page: 1,
            snippet: `Problem generated from ${syllabusName} context`,
            source: syllabusName,
          },
        ],
      }),
    };

    setChatHistories((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), problemMessage],
    }));

    setQuizMode({ active: true, topic: problem.topic, awaitingAnswer: true });
    setWhiteboardOpen(true);
    setDocViewerOpen(false);
    currentProblemRef.current = problem;
  }, [messages, syllabus, activeSessionId]);

  const handleEndQuiz = useCallback(() => {
    setQuizMode(null);
    setWhiteboardOpen(false);
    currentProblemRef.current = null;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setChatHistories((prev) => ({
      ...prev,
      [activeSessionId]: [
        ...(prev[activeSessionId] || []),
        {
          id: Date.now(),
          sender: "bot" as const,
          timestamp: now,
          text: "Quiz challenge ended. Feel free to ask me anything or start another challenge!",
        },
      ],
    }));
  }, [activeSessionId]);

  // Auto-end quiz when switching sessions
  useEffect(() => {
    if (quizMode?.active) {
      setQuizMode(null);
      setWhiteboardOpen(false);
      currentProblemRef.current = null;
    }
  }, [activeSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (text: string) => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: now,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId && s.title === "New Chat"
          ? { ...s, title: generateTitle(text), date: "Just now" }
          : s
      )
    );

    setChatHistories((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), userMessage],
    }));

    // Start Typing Indicator
    setIsTyping(true);

    // Quiz mode: grade the answer instead of normal response
    if (quizMode?.active && quizMode.awaitingAnswer && currentProblemRef.current) {
      setTimeout(() => {
        const gradingText = generateGradingResponse(
          currentProblemRef.current!,
          text,
          syllabus?.name ?? null
        );

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: gradingText,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setChatHistories((prev) => ({
          ...prev,
          [activeSessionId]: [...(prev[activeSessionId] || []), botMessage],
        }));
        setIsTyping(false);
        setQuizMode((prev) =>
          prev ? { ...prev, awaitingAnswer: false } : null
        );
      }, 1800);
      return;
    }

    // Simulate bot response with citation if syllabus is active
    setTimeout(() => {
      const hasSyllabus = syllabus !== null;
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: hasSyllabus
          ? "Thanks for your question! Based on your uploaded syllabus [p. 1], I can see this relates to the course overview.\n\n> This is a **demo response** showcasing citation and document context features."
          : "Thanks for your question! I'm analyzing it now. In a full implementation, this would connect to an AI backend for real academic support.\n\n> This is a **demo response** showcasing the markdown rendering capabilities.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ...(hasSyllabus && {
          citations: [
            {
              label: "p. 1",
              page: 1,
              snippet:
                "CS201 — Data Structures & Algorithms. This course covers fundamental data structures and algorithmic techniques.",
              source: syllabus.name,
              file_id: "demo-cs201",
              highlight_text: "Data Structures & Algorithms",
            },
          ],
        }),
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), botMessage],
      }));
      // Stop Typing Indicator
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        syllabus={syllabus}
        onSyllabusUpload={setSyllabus}
        onSyllabusRemove={() => setSyllabus(null)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          referenceOpen={referenceOpen}
          onToggleReference={() => setReferenceOpen(!referenceOpen)}
          studyToolsOpen={studyToolsOpen}
          onToggleStudyTools={() => setStudyToolsOpen(!studyToolsOpen)}
          onExportTranscript={() => {
            const session = sessions.find((s) => s.id === activeSessionId);
            exportTranscript({
              messages,
              sessionTitle: session?.title || "Chat Transcript",
            });
          }}
          quizModeActive={quizMode?.active ?? false}
          onStartQuiz={handleStartQuiz}
          onEndQuiz={handleEndQuiz}
        />

        {/* Quiz Mode Banner */}
        <AnimatePresence>
          {quizMode?.active && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                    Quiz Challenge Active
                  </span>
                  <span className="text-xs text-amber-500">
                    — {quizMode.topic}
                  </span>
                </div>
                <button
                  onClick={handleEndQuiz}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                >
                  End Challenge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <ChatContainer
          messages={messages}
          isTyping={isTyping}
          onCitationClick={handleCitationClick}
        />

        {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
          <div className="px-4 py-2 flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {quizMode?.active && !quizMode.awaitingAnswer ? (
              // Post-grading chips
              ["Try another problem", "Explain step 2 more", "I need more practice"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    if (chip === "Try another problem") {
                      handleStartQuiz();
                    } else {
                      handleSend(chip);
                    }
                  }}
                  className="text-xs font-medium px-4 py-2 bg-white border border-amber-200 text-amber-700 hover:border-amber-400 hover:text-amber-800 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  {chip}
                </button>
              ))
            ) : quizMode?.active && quizMode.awaitingAnswer ? (
              // Awaiting answer hint
              <p className="text-xs text-slate-400 italic">
                Type your answer in the input below, or use the scratch pad for rough work
              </p>
            ) : (
              // Normal chips
              ["Explain further", "Give me an example", "Summarize this"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="text-xs font-medium px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  {chip}
                </button>
              ))
            )}
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </div>

      {/* Reference Panel */}
      <AnimatePresence>
        {referenceOpen && (
          <ReferencePanel onClose={() => setReferenceOpen(false)} />
        )}
      </AnimatePresence>

      {/* Document Viewer */}
      <AnimatePresence>
        {docViewerOpen && (
          <DocumentViewer
            fileName={docViewerFile}
            pdfUrl={docViewerPdfUrl}
            initialPage={docViewerPage}
            highlightText={docViewerHighlight}
            highlightBox={docViewerHighlightBox}
            paragraphIndex={docViewerParagraphIndex}
            onClose={() => setDocViewerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Whiteboard Panel */}
      <AnimatePresence>
        {whiteboardOpen && (
          <WhiteboardPanel onClose={() => setWhiteboardOpen(false)} />
        )}
      </AnimatePresence>

      {/* Study Tools Sidebar */}
      <StudyToolsSidebar
        open={studyToolsOpen}
        onToggle={() => setStudyToolsOpen(!studyToolsOpen)}
      />
    </div>
  );
}