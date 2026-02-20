"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/sidebar";
import { ChatHeader } from "./components/chat-header";
import { MessageBubble, type ChatMessage } from "./components/message-bubble";
import { ChatInput } from "./components/chat-input";
import { ReferencePanel } from "./components/reference-panel";
import "katex/dist/katex.min.css";

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    timestamp: "10:00 AM",
    text: `## Welcome to EduBot! 👋

I'm your **Senior Academic Advisor**. I can help you with:

- [ ] Reviewing course material
- [ ] Solving math problems step-by-step
- [ ] Formatting essays and theses
- [x] Getting started with your session

Feel free to ask me anything — from algebra to essay writing!`,
  },
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

We can also check: $(-2)^2 + 5(-2) + 6 = 4 - 10 + 6 = 0$ ✓`,
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
  },
];

export default function ConversationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "Thanks for your question! I'm analyzing it now. In a full implementation, this would connect to an AI backend for real academic support.\n\n> This is a **demo response** showcasing the markdown rendering capabilities.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1200);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          referenceOpen={referenceOpen}
          onToggleReference={() => setReferenceOpen(!referenceOpen)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </div>

      {/* Reference Panel */}
      <AnimatePresence>
        {referenceOpen && (
          <ReferencePanel onClose={() => setReferenceOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
