"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, RefreshCw, Sparkles } from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

const sampleCards: Flashcard[] = [
  {
    id: 1,
    front: "What is the Quadratic Formula?",
    back: "x = (-b ± √(b² - 4ac)) / 2a, used to solve ax² + bx + c = 0",
  },
  {
    id: 2,
    front: "What is the Discriminant?",
    back: "b² - 4ac — determines the number of real solutions. Positive = 2, Zero = 1, Negative = 0",
  },
  {
    id: 3,
    front: "Difference of Squares",
    back: "a² - b² = (a + b)(a - b)",
  },
];

export function FlashcardWidget() {
  const [cards, setCards] = useState<Flashcard[]>(sampleCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleGenerate = () => {
    // Simulate generating new cards from chat
    setCards(sampleCards);
    setCurrentIndex(0);
    setFlipped(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Layers className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">Flashcard Deck</h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate from Chat
      </button>

      {currentCard && (
        <>
          <motion.div
            onClick={() => setFlipped(!flipped)}
            className="relative cursor-pointer min-h-[120px] rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-center text-center transition-shadow hover:shadow-md"
            whileTap={{ scale: 0.98 }}
          >
            <div>
              {!flipped ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Question
                  </p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {currentCard.front}
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-2">
                    Answer
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentCard.back}
                  </p>
                </motion.div>
              )}
            </div>

            <span className="absolute bottom-2 right-3 text-[10px] text-slate-300">
              tap to {flipped ? "hide" : "reveal"}
            </span>
          </motion.div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Next Card
          </button>
        </>
      )}
    </div>
  );
}
