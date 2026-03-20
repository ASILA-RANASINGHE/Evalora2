"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Bot, MessageCircle } from "lucide-react";
import Link from "next/link";

const navLinks = ["Home", "Features", "Pricing", "Integrations", "Blog"];

const partners = ["Network", "Chain", "Snowflake", "Vision"];

// ─── Animation variants ──────────────────────────────────────────

const slideUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.6,
      ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    },
  },
};

const bubbleBounce: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15,
      delay: 1.2,
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const navFade: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const partnerFade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 1.4 + i * 0.1, ease: "easeOut" as const },
  }),
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#1a1a6e] text-white font-sans overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navFade}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#1a1a6e]/90 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Bot className="h-7 w-7" />
          Zenbot
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="hover:text-white/80 transition-colors"
            >
              {link}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden sm:inline-block text-sm font-medium hover:text-white/80 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="#"
            className="bg-white text-[#1a1a6e] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background decorative blurs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center md:text-left"
          >
            {/* Heading — Slide Up & Fade In */}
            <motion.h1
              variants={slideUp}
              custom={0}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight"
            >
              Revolutionize
              <br />
              Customer Service
              <br />
              with{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Ai Chatbots.
              </span>
            </motion.h1>

            {/* Subtitle — Slide Up with stagger */}
            <motion.p
              variants={slideUp}
              custom={0.2}
              className="mt-7 text-base sm:text-lg text-white/70 max-w-md mx-auto md:mx-0 leading-relaxed"
            >
              Deliver instant, intelligent support 24/7. Reduce response times,
              cut costs, and delight your customers with AI-powered
              conversations.
            </motion.p>

            {/* CTA Button — Slide Up + Hover Scale */}
            <motion.div variants={slideUp} custom={0.4} className="mt-9">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Link
                  href="/protected/chat/conversation"
                  className="inline-flex items-center gap-2.5 bg-white text-[#1a1a6e] font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-shadow"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Right Column — Glassmorphism Card + Float ── */}
          <div className="flex justify-center md:justify-end">
            {/* Floating wrapper — CSS keyframe float */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              className="relative animate-float"
            >
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[22rem] lg:h-[22rem]">
                {/* Glassmorphism card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl shadow-black/10">
                    {/* Inner subtle ring */}
                    <div className="w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Bot className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-white/90 drop-shadow-lg" />
                    </div>
                  </div>
                </div>

                {/* Speech bubble — bounce entrance with delay */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={bubbleBounce}
                  className="absolute -top-3 right-2 sm:-right-2"
                >
                  <div className="relative bg-white text-[#1a1a6e] font-semibold text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Hi I&apos;m Robo!
                    {/* Bubble tail */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 rounded-sm" />
                  </div>
                </motion.div>

                {/* Orbiting decorative dots */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-cyan-400/60" />
                  <div className="absolute bottom-10 right-4 w-1.5 h-1.5 rounded-full bg-blue-300/50" />
                  <div className="absolute top-1/2 -left-2 w-2.5 h-2.5 rounded-full bg-indigo-300/40" />
                </motion.div>

                {/* Glow behind card */}
                <div className="absolute inset-0 -z-10 bg-blue-400/10 blur-[60px] rounded-full scale-150" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-center text-sm text-white/50 mb-8"
          >
            Trusted by more than 500,000+ companies across the globe:
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {partners.map((name, i) => (
              <motion.span
                key={name}
                initial="hidden"
                animate="visible"
                variants={partnerFade}
                custom={i}
                className="text-lg sm:text-xl font-bold text-white/25 tracking-widest uppercase"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
