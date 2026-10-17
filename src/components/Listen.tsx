"use client";
import { useEffect, useState } from "react";
import { speak, speechSupported, stopSpeaking } from "@/lib/speech";

/** Read-aloud toggle using the browser's speech synthesis. Hidden where speech is unsupported. */
export function ListenButton({ text, label = "Listen", className = "" }: { text: string; label?: string; className?: string }) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(speechSupported());
    return () => stopSpeaking();
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={() => {
        if (playing) {
          stopSpeaking();
          setPlaying(false);
        } else {
          setPlaying(true);
          speak(text, () => setPlaying(false));
        }
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${playing ? "border-white bg-white text-ink" : "border-white/40 text-white hover:bg-white/10"} ${className}`}
    >
      <span aria-hidden="true">{playing ? "■" : "▶"}</span>
      {playing ? "Stop" : label}
    </button>
  );
}

/** Same control for light backgrounds. */
export function ListenInline({ text, label = "Listen" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(speechSupported());
    return () => stopSpeaking();
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={() => {
        if (playing) {
          stopSpeaking();
          setPlaying(false);
        } else {
          setPlaying(true);
          speak(text, () => setPlaying(false));
        }
      }}
      className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-600 underline-offset-2 hover:underline"
    >
      <span aria-hidden="true">{playing ? "■" : "▶"}</span>
      {playing ? "Stop" : label}
    </button>
  );
}
