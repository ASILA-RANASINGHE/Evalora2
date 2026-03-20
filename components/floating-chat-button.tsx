"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function FloatingChatButton() {
  return (
    <Link href="/protected/chat" aria-label="Open chat" className="fixed bottom-6 right-6 z-50">
      <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 ring-0 focus:outline-none focus:ring-2 focus:ring-sky-300">
        <Image src="/robot.png" alt="Chat" width={46} height={46} className="object-contain" priority />
      </div>
    </Link>
  );
}
