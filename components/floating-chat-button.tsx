"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function FloatingChatButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onOpen() {
      setHidden(true);
    }
    function onClose() {
      setHidden(false);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("pdf:open", onOpen);
      window.addEventListener("pdf:close", onClose);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pdf:open", onOpen);
        window.removeEventListener("pdf:close", onClose);
      }
    };
  }, []);

  if (hidden) return null;

  return (
    <Link href="/protected/chat" aria-label="Open chat" className="fixed bottom-6 right-6 z-50">
      <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 ring-0 focus:outline-none focus:ring-2 focus:ring-sky-300">
        <Image src="/robot.png" alt="Chat" width={46} height={46} className="object-contain" priority />
      </div>
    </Link>
  );
}
