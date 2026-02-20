"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, MessageCircle } from "lucide-react";
import Link from "next/link";

const navLinks = ["Home", "Features", "Pricing", "Integrations", "Blog"];

const partners = ["Network", "Chain", "Snowflake", "Vision"];

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#0066FF] text-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0066FF]/95 backdrop-blur-sm">
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
            className="bg-white text-[#0066FF] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight"
            >
              Revolutionize Customer Service with{" "}
              <span className="text-white/90">Ai Chatbots.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-white/80 max-w-md mx-auto md:mx-0 leading-relaxed"
            >
              Deliver instant, intelligent support 24/7. Reduce response times,
              cut costs, and delight your customers with AI-powered
              conversations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <Link
                href="/protected/chat/conversation"
                className="inline-flex items-center gap-2 bg-white text-[#0066FF] font-semibold px-7 py-3.5 rounded-full text-base hover:bg-gray-100 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Robot */}
          <div className="flex justify-center md:justify-end">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Robot placeholder */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                {/* Robot body */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl">
                    <Bot className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 text-white/90" />
                  </div>
                </div>

                {/* Speech bubble */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-2 right-0 sm:-right-4 bg-white text-[#0066FF] font-semibold text-sm px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hi I&apos;m Robo!
                </motion.div>

                {/* Glow effect */}
                <div className="absolute inset-0 -z-10 bg-white/5 blur-3xl rounded-full scale-125" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
          <p className="text-center text-sm text-white/60 mb-8">
            Trusted by more than 500,000+ companies across the globe:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {partners.map((name) => (
              <span
                key={name}
                className="text-lg sm:text-xl font-bold text-white/30 tracking-widest uppercase"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
