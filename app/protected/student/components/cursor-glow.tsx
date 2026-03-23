"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -400, y: -400 });
  const current = useRef({ x: -400, y: -400 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth lerp follow
      current.current.x += (pos.current.x - current.current.x) * 0.05;
      current.current.y += (pos.current.y - current.current.y) * 0.05;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(105,111,199,0.22) 0%, rgba(77,47,178,0.12) 35%, transparent 70%)",
          filter: "blur(35px)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
