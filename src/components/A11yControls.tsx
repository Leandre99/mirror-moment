"use client";
import { useEffect, useState } from "react";

const KEY = "mirror-moment:a11y";
type Prefs = { large: boolean; contrast: boolean };

function apply(p: Prefs) {
  const el = document.documentElement;
  el.classList.toggle("a11y-large", p.large);
  el.classList.toggle("a11y-contrast", p.contrast);
}

/** Text-size and high-contrast switches, remembered on this device. */
export function A11yControls() {
  const [prefs, setPrefs] = useState<Prefs>({ large: false, contrast: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null") as Prefs | null;
      if (saved) {
        setPrefs(saved);
        apply(saved);
      } else if (window.matchMedia?.("(prefers-contrast: more)").matches) {
        const p = { large: false, contrast: true };
        setPrefs(p);
        apply(p);
      }
    } catch {}
  }, []);

  function toggle(k: keyof Prefs) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  const base = "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2.5 text-xs font-semibold transition";
  const on = "border-ink bg-ink text-white";
  const off = "border-stone-300 bg-white text-stone-800 hover:border-stone-400";

  return (
    <div role="group" aria-label="Accessibility settings" className="flex items-center gap-1.5">
      <button type="button" aria-pressed={prefs.large} aria-label="Larger text" onClick={() => toggle("large")} className={`${base} ${prefs.large ? on : off}`}>
        A<span className="text-[10px]">+</span>
      </button>
      <button type="button" aria-pressed={prefs.contrast} aria-label="High contrast" onClick={() => toggle("contrast")} className={`${base} ${prefs.contrast ? on : off}`}>
        <span aria-hidden="true">{"◑"}</span>
      </button>
    </div>
  );
}
