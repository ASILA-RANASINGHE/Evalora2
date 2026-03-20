"use client";

import { motion, type Variants } from "framer-motion";

export function TypingIndicator() {
  const dotVariants: Variants = {
    initial: { y: 0 },
    animate: (i: number) => ({
      y: [-8, 0, -8],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeInOut" as const,
      },
    }),
  };

  const pulseVariants: Variants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const shimmerVariants: Variants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear" as const,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3 max-w-3xl mx-auto"
    >
      {/* Animated Avatar */}
      <motion.div
        className="relative flex-shrink-0"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <motion.span
            className="text-white text-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🤖
          </motion.span>
        </div>
        {/* Pulse ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.6, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Typing Bubble */}
      <motion.div
        className="relative bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-md border border-slate-100 overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />

        <div className="flex items-center gap-4">
          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                className="w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${
                    ["#3B82F6", "#8B5CF6", "#EC4899"][i]
                  } 0%, ${["#60A5FA", "#A78BFA", "#F472B6"][i]} 100%)`,
                  boxShadow: `0 2px 8px ${
                    [
                      "rgba(59,130,246,0.4)",
                      "rgba(139,92,246,0.4)",
                      "rgba(236,72,153,0.4)",
                    ][i]
                  }`,
                }}
              />
            ))}
          </div>

          {/* Animated text */}
          <motion.span
            className="text-sm text-slate-500 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            EduBot is thinking
          </motion.span>

          {/* Spinning loader */}
          <motion.div
            className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}