"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type VoiceState = "idle" | "listening" | "processing" | "error";

interface VoiceInputModalProps {
  open: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

// ─── SpeechRecognition type shim ──────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getSpeechRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;
  const SR =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  if (!SR) return null;
  return new (SR as new () => SpeechRecognitionInstance)();
}

// ─── Sound Wave Visualizer (Canvas) ───────────────────────────────

function useAudioVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean
) {
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 48;
      const barWidth = 3;
      const gap = (w - barCount * barWidth) / (barCount + 1);
      const centerY = h / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(
          (i < barCount / 2 ? barCount / 2 - i : i - barCount / 2) *
            (bufferLength / barCount) *
            0.6
        );
        const value = dataArray[dataIndex] || 0;
        const normalised = value / 255;
        const barHeight = Math.max(4, normalised * (h * 0.42));

        const x = gap + i * (barWidth + gap);

        const hue = 220 + normalised * 30;
        const alpha = 0.5 + normalised * 0.5;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
        ctx.fill();
      }
    };

    render();
  }, [canvasRef]);

  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      frame++;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 48;
      const barWidth = 3;
      const gap = (w - barCount * barWidth) / (barCount + 1);
      const centerY = h / 2;

      for (let i = 0; i < barCount; i++) {
        const wave = Math.sin((i * 0.3) + (frame * 0.04)) * 0.3 + 0.15;
        const barHeight = Math.max(4, wave * h * 0.35);

        const x = gap + i * (barWidth + gap);
        ctx.fillStyle = `hsla(220, 70%, 65%, ${0.3 + wave * 0.4})`;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
        ctx.fill();
      }
    };

    render();
  }, [canvasRef]);

  const stop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      draw();
    } catch {
      // Permission denied or no mic — fallback to idle animation
      drawIdle();
    }
  }, [draw, drawIdle]);

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [active, start, stop]);
}

// ─── Main Component ───────────────────────────────────────────────

export function VoiceInputModal({
  open,
  onClose,
  onTranscript,
}: VoiceInputModalProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs that mirror state so recognition callbacks read live values
  // instead of stale closure captures.
  const stateRef = useRef<VoiceState>(state);
  stateRef.current = state;
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  // Audio visualizer
  useAudioVisualizer(canvasRef, state === "listening");

  // Handle canvas DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, [open]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
  }, [clearSilenceTimer]);

  const startRecognition = useCallback(() => {
    setTranscript("");
    setInterimText("");
    setErrorMessage("");

    const recognition = getSpeechRecognition();

    if (!recognition) {
      setState("error");
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setState("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer();

      let final = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setTranscript(final);
      setInterimText(interim);

      // Auto-close after 2.5s of silence once we have text
      if (final) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecognition();
          onTranscript(final.trim());
          setState("idle");
          onClose();
        }, 2500);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();

      const messages: Record<string, string> = {
        "not-allowed":
          "Microphone access was denied. Please allow microphone permission in your browser settings.",
        "service-not-allowed":
          "Speech recognition service is unavailable. Please use Chrome or Edge with an active internet connection.",
        "no-speech":
          "No speech was detected. Please try again and speak clearly.",
        "audio-capture":
          "No microphone was found. Please connect a microphone and try again.",
        network:
          "A network error occurred. Please check your connection and try again.",
        aborted: "",
      };

      const msg = messages[event.error];
      if (msg === "") return; // aborted — user cancelled, no error to show

      setState("error");
      setErrorMessage(
        msg || `Speech recognition error: ${event.error}`
      );
    };

    recognition.onend = () => {
      // Read live values via refs to avoid stale closure captures
      if (stateRef.current === "listening" && transcriptRef.current) {
        const finalText = transcriptRef.current.trim();
        if (finalText) {
          onTranscript(finalText);
        }
      }
      setState("idle");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setState("error");
      setErrorMessage("Failed to start speech recognition. Please try again.");
    }
  }, [clearSilenceTimer, stopRecognition, onTranscript, onClose]);

  // Start recognition when modal opens
  useEffect(() => {
    if (open) {
      startRecognition();
    } else {
      stopRecognition();
      setState("idle");
      setTranscript("");
      setInterimText("");
      setErrorMessage("");
    }

    return () => {
      stopRecognition();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    const finalText = transcript.trim();
    if (finalText) {
      onTranscript(finalText);
    }
    stopRecognition();
    setState("idle");
    onClose();
  };

  const handleRetry = () => {
    setState("idle");
    setErrorMessage("");
    startRecognition();
  };

  const displayText = transcript + (interimText ? ` ${interimText}` : "");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>

            <div className="px-8 pt-10 pb-8 flex flex-col items-center">
              {/* ── Error State ── */}
              {state === "error" ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xs mb-6">
                    {errorMessage}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Mic Icon with pulse rings ── */}
                  <div className="relative mb-6">
                    {/* Pulse rings */}
                    {state === "listening" && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 rounded-full bg-blue-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.5,
                          }}
                          className="absolute inset-0 rounded-full bg-blue-400"
                        />
                      </>
                    )}

                    <motion.div
                      animate={
                        state === "listening"
                          ? { scale: [1, 1.06, 1] }
                          : { scale: 1 }
                      }
                      transition={
                        state === "listening"
                          ? {
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                        state === "listening"
                          ? "bg-blue-600"
                          : "bg-slate-200"
                      }`}
                    >
                      {state === "listening" ? (
                        <Mic className="h-9 w-9 text-white" />
                      ) : (
                        <MicOff className="h-9 w-9 text-slate-400" />
                      )}
                    </motion.div>
                  </div>

                  {/* Status text */}
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    {state === "listening"
                      ? "Listening... Speak now"
                      : "Initializing microphone..."}
                  </p>

                  {/* ── Sound wave canvas ── */}
                  <div className="w-full h-16 mb-5">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ width: "100%", height: "64px" }}
                    />
                  </div>

                  {/* ── Live transcript ── */}
                  <div className="w-full min-h-[52px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {displayText ? (
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {transcript}
                        {interimText && (
                          <span className="text-slate-400">{` ${interimText}`}</span>
                        )}
                        <motion.span
                          animate={{ opacity: [1, 1, 0, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            times: [0, 0.49, 0.5, 1],
                            ease: "linear",
                          }}
                          className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-text-bottom"
                        />
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Your speech will appear here...
                      </p>
                    )}
                  </div>

                  {/* ── Actions ── */}
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    {displayText.trim() && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                          const text = displayText.trim();
                          stopRecognition();
                          onTranscript(text);
                          setState("idle");
                          onClose();
                        }}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Use Text
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
