"use client";
import type { Plan } from "./agent";
import { CONCERNS, type SkinScan } from "./concerns";

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/** Best installed English voice (US first, then UK, then any English), preferring ones that run on this device. */
export function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  if (!speechSupported()) return undefined;
  const english = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const rank = (v: SpeechSynthesisVoice) => (v.lang.toLowerCase() === "en-us" ? 0 : v.lang.toLowerCase() === "en-gb" ? 1 : 2) + (v.localService ? 0 : 0.5);
  return english.sort((a, b) => rank(a) - rank(b))[0];
}

/** Reads text aloud with an English voice, so English text is never read with a French voice. */
export function speak(text: string, onEnd?: () => void) {
  if (!speechSupported()) return onEnd?.();
  const synth = window.speechSynthesis;
  synth.cancel();
  const run = () => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickEnglishVoice();
    u.lang = voice?.lang || "en-US";
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    synth.speak(u);
  };
  // Voices load asynchronously in some browsers; wait briefly for them the first time.
  if (synth.getVoices().length === 0) {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      synth.removeEventListener("voiceschanged", go);
      run();
    };
    synth.addEventListener("voiceschanged", go);
    setTimeout(go, 800);
  } else {
    run();
  }
}

function stepWord(step: string) {
  return step === "spot" ? "spot treatment" : step;
}

/** A spoken summary of the results page, written to be heard rather than read. */
export function resultsToSpeech(scan: SkinScan, plan: Plan) {
  const parts: string[] = [];
  parts.push(`Your overall skin score is ${scan.overall} out of 100.`);
  if (scan.skinAge) parts.push(`Your skin looks about ${scan.skinAge} years old.`);
  parts.push(`Skin type: ${scan.skinType.toLowerCase()}.`);
  parts.push(`${plan.headline}.`);
  parts.push(plan.summary);
  if (plan.priorities.length) {
    parts.push(`Your focus areas are ${plan.priorities.map((p) => `${CONCERNS[p.key].label.toLowerCase()}, ${p.ui} out of 100`).join("; ")}.`);
  }
  const am = plan.routine.AM.map((s) => `${stepWord(s.step)}: ${s.product.brand} ${s.product.name}`);
  const pm = plan.routine.PM.map((s) => `${stepWord(s.step)}: ${s.product.brand} ${s.product.name}`);
  if (am.length) parts.push(`Morning routine. ${am.join(". ")}.`);
  if (pm.length) parts.push(`Night routine. ${pm.join(". ")}.`);
  if (plan.avoid.length) parts.push(`Avoid for now: ${plan.avoid.map((a) => `${a.what}. ${a.why}`).join(" ")}`);
  parts.push("This is cosmetic guidance, not medical advice.");
  return parts.join(" ");
}
